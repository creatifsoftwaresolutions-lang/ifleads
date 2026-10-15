import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors.js';
import type {
  AvailabilityQuery,
  BlockInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
} from './appointment.schema.js';

// ─── Helpers ───

async function collectDescendants(rootId: string): Promise<string[]> {
  const all = await prisma.user.findMany({
    where: { managerId: { not: null } },
    select: { id: true, managerId: true },
  });
  const childrenOf: Record<string, string[]> = {};
  for (const u of all) {
    if (u.managerId) (childrenOf[u.managerId] ??= []).push(u.id);
  }
  const result = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const c of childrenOf[cur] ?? []) {
      if (!result.has(c)) {
        result.add(c);
        stack.push(c);
      }
    }
  }
  return [...result];
}

async function scopeForUser(req: AuthRequest): Promise<string[]> {
  const actor = req.user!;
  if (actor.role === 'ADMIN' || actor.role === 'CEO') {
    const all = await prisma.user.findMany({
      where: { organizationId: actor.organizationId },
      select: { id: true },
    });
    return all.map((u) => u.id);
  }
  const desc = await collectDescendants(actor.id);
  return [actor.id, ...desc];
}

async function canActOnUser(req: AuthRequest, targetId: string): Promise<boolean> {
  const actor = req.user!;
  if (actor.id === targetId) return true;
  if (actor.role === 'ADMIN' || actor.role === 'CEO') return true;
  const scoped = await scopeForUser(req);
  return scoped.includes(targetId);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;

// ─── Service ───

export const appointmentService = {
  async list(req: AuthRequest, q: ListAppointmentsQuery) {
    const actor = req.user!;
    const scoped = await scopeForUser(req);

    const where: any = { organizationId: actor.organizationId };
    // scope: appointments assigned to, requested by, or booked for anyone in my subtree
    where.OR = [
      { assignedToId: { in: scoped } },
      { requestedById: { in: scoped } },
      { forUserId: { in: scoped } },
    ];

    if (q.status) where.status = q.status;
    if (q.from || q.to) {
      where.startAt = {};
      if (q.from) where.startAt.gte = new Date(q.from);
      if (q.to) where.startAt.lte = new Date(q.to);
    }

    if (q.view === 'mine') where.assignedToId = actor.id;
    if (q.view === 'forMe') where.forUserId = actor.id;
    if (q.view === 'requests') {
      where.approverId = actor.id;
      where.status = 'PENDING';
    }
    if (q.view === 'today') {
      const now = new Date();
      where.startAt = { gte: startOfDay(now), lte: endOfDay(now) };
    }
    if (q.view === 'overdue') {
      where.startAt = { lt: new Date() };
      where.status = { in: ['PENDING', 'SCHEDULED', 'APPROVED', 'CONFIRMED'] };
    }

    const [rows, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          requestedBy: { select: { id: true, name: true } },
          forUser: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
        orderBy: { startAt: 'asc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: rows,
      meta: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    };
  },

  async getById(req: AuthRequest, id: string) {
    const scoped = await scopeForUser(req);
    const appt = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
        OR: [
          { assignedToId: { in: scoped } },
          { requestedById: { in: scoped } },
          { forUserId: { in: scoped } },
        ],
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        requestedBy: { select: { id: true, name: true } },
        forUser: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
    if (!appt) throw new NotFoundError('Appointment not found');
    return appt;
  },

  async availability(req: AuthRequest, q: AvailabilityQuery) {
    const actor = req.user!;
    const canSee = await canActOnUser(req, q.userId);
    if (!canSee) throw new ForbiddenError('Not in your scope');

    const date = new Date(`${q.date}T00:00:00`);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const [blocks, appts] = await Promise.all([
      prisma.timeBlock.findMany({
        where: {
          userId: q.userId,
          organizationId: actor.organizationId,
          startAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.appointment.findMany({
        where: {
          assignedToId: q.userId,
          organizationId: actor.organizationId,
          startAt: { gte: dayStart, lte: dayEnd },
          status: { in: ['SCHEDULED', 'CONFIRMED', 'APPROVED', 'PENDING'] },
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          status: true,
        },
      }),
    ]);

    const slots = [];
    for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
      const slotStart = new Date(date);
      slotStart.setHours(h, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(h + 1, 0, 0, 0);

      const block = blocks.find(
        (b) => b.startAt <= slotStart && b.endAt > slotStart
      );
      const appt = appts.find(
        (a) => a.startAt < slotEnd && a.endAt > slotStart
      );

      let status: 'available' | 'booked' | 'blocked' | 'pending' = 'available';
      let meta: any = null;
      if (block) {
        status = 'blocked';
        meta = { reason: block.reason };
      } else if (appt) {
        status = appt.status === 'PENDING' ? 'pending' : 'booked';
        meta = { id: appt.id, title: appt.title, status: appt.status };
      }

      slots.push({
        hour: h,
        label: `${h}:00 ${h < 12 ? 'AM' : 'PM'}`,
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        status,
        meta,
      });
    }

    return { userId: q.userId, date: q.date, slots };
  },

  async create(req: AuthRequest, input: CreateAppointmentInput) {
    const actor = req.user!;
    const targetUserId = input.forUserId ?? actor.id;

    const canBook = await canActOnUser(req, targetUserId);
    if (!canBook) throw new ForbiddenError('Cannot book for this user');

    // Duplicate check
    const overlap = await prisma.appointment.findFirst({
      where: {
        assignedToId: targetUserId,
        status: { in: ['PENDING', 'SCHEDULED', 'CONFIRMED', 'APPROVED'] },
        AND: [
          { startAt: { lt: new Date(input.endAt) } },
          { endAt: { gt: new Date(input.startAt) } },
        ],
      },
    });
    if (overlap) throw new ConflictError('Time slot already booked');

    // Blocked slot check
    const blocked = await prisma.timeBlock.findFirst({
      where: {
        userId: targetUserId,
        AND: [
          { startAt: { lt: new Date(input.endAt) } },
          { endAt: { gt: new Date(input.startAt) } },
        ],
      },
    });
    if (blocked) throw new ConflictError('Slot is blocked');

    // Self-booked → SCHEDULED. Cross-user → PENDING unless I'm their manager/CEO/ADMIN.
    const isSelf = targetUserId === actor.id;
    let status: 'SCHEDULED' | 'PENDING' = 'SCHEDULED';
    let approverId: string | null = null;

    if (!isSelf) {
      const target = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, managerId: true },
      });
      if (!target) throw new NotFoundError('Target user not found');

      // The person whose calendar is being booked approves it
      status = 'PENDING';
      approverId = targetUserId;
    }

    return prisma.appointment.create({
      data: {
        organizationId: actor.organizationId,
        title: input.title,
        description: input.description,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        location: input.location,
        leadId: input.leadId,
        customerId: input.customerId,
        assignedToId: targetUserId,
        requestedById: actor.id,
        forUserId: targetUserId,
        approverId,
        status,
      },
    });
  },

  async approve(req: AuthRequest, id: string) {
    const actor = req.user!;
    const appt = await prisma.appointment.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!appt) throw new NotFoundError('Not found');
    if (appt.status !== 'PENDING') throw new ValidationError('Not pending');

    const canApprove =
      actor.role === 'ADMIN' ||
      actor.role === 'CEO' ||
      appt.approverId === actor.id ||
      appt.assignedToId === actor.id ||
      appt.forUserId === actor.id;
    if (!canApprove) throw new ForbiddenError('Cannot approve this appointment');

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approverId: actor.id,
        approvedAt: new Date(),
      },
    });

    // Notify the person who requested it
    if (updated.requestedById && updated.requestedById !== actor.id) {
      try {
        await prisma.notification.create({
          data: {
            organizationId: actor.organizationId,
            userId: updated.requestedById,
            type: 'appointment.approved',
            title: `Appointment "${updated.title}" was approved`,
            data: {
              appointmentId: updated.id,
              approvedBy: actor.name,
            },
          },
        });
      } catch (e) {
        console.error('[appointment.approve.notify]', e);
      }
    }

    return updated;
  },

  async decline(req: AuthRequest, id: string, reason?: string) {
    const actor = req.user!;
    const appt = await prisma.appointment.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!appt) throw new NotFoundError('Not found');
    if (appt.status !== 'PENDING') throw new ValidationError('Not pending');

    const canDecline =
      actor.role === 'ADMIN' ||
      actor.role === 'CEO' ||
      appt.approverId === actor.id ||
      appt.assignedToId === actor.id ||
      appt.forUserId === actor.id;
    if (!canDecline) throw new ForbiddenError('Cannot decline');

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'DECLINED',
        approverId: actor.id,
        approvedAt: new Date(),
        declineReason: reason,
      },
    });

    if (updated.requestedById && updated.requestedById !== actor.id) {
      try {
        await prisma.notification.create({
          data: {
            organizationId: actor.organizationId,
            userId: updated.requestedById,
            type: 'appointment.declined',
            title: `Appointment "${updated.title}" was declined`,
            data: {
              appointmentId: updated.id,
              declinedBy: actor.name,
              reason: reason ?? null,
            },
          },
        });
      } catch (e) {
        console.error('[appointment.decline.notify]', e);
      }
    }

    return updated;
  },

  async cancel(req: AuthRequest, id: string) {
    const actor = req.user!;
    const appt = await prisma.appointment.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!appt) throw new NotFoundError('Not found');

    const canCancel =
      actor.role === 'ADMIN' ||
      actor.role === 'CEO' ||
      appt.assignedToId === actor.id ||
      appt.requestedById === actor.id ||
      appt.forUserId === actor.id;
    if (!canCancel) throw new ForbiddenError('Cannot cancel');

    return prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  },

  async block(req: AuthRequest, input: BlockInput) {
    const actor = req.user!;
    const targetUserId = input.userId ?? actor.id;

    const canBlock = await canActOnUser(req, targetUserId);
    if (!canBlock) throw new ForbiddenError('Cannot block this user');

    const date = new Date(`${input.date}T00:00:00`);
    const startAt = new Date(date);
    startAt.setHours(input.startHour, 0, 0, 0);
    const endAt = new Date(date);
    endAt.setHours(input.endHour, 0, 0, 0);

    return prisma.timeBlock.create({
      data: {
        organizationId: actor.organizationId,
        userId: targetUserId,
        date,
        startAt,
        endAt,
        reason: input.reason,
        createdById: actor.id,
      },
    });
  },

  async unblock(req: AuthRequest, id: string) {
    const actor = req.user!;
    const block = await prisma.timeBlock.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!block) throw new NotFoundError('Block not found');

    const canRemove =
      actor.role === 'ADMIN' ||
      actor.role === 'CEO' ||
      block.userId === actor.id ||
      block.createdById === actor.id;
    if (!canRemove) throw new ForbiddenError('Cannot unblock');

    await prisma.timeBlock.delete({ where: { id } });
    return { ok: true };
  },

  async listBlocks(req: AuthRequest, from: string, to: string) {
    const scoped = await scopeForUser(req);
    return prisma.timeBlock.findMany({
      where: {
        organizationId: req.user!.organizationId,
        userId: { in: scoped },
        date: { gte: new Date(from), lte: new Date(to) },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  },
};
