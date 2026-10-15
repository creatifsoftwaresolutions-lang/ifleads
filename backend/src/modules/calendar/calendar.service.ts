import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

async function scopeFor(req: AuthRequest): Promise<any> {
  const u = req.user!;
  if (u.role === 'ADMIN') return {};
  if (u.role === 'CEO') return { organizationId: u.organizationId };
  if (u.role === 'BDM') {
    const ids = await collectDesc(u.id);
    return { organizationId: u.organizationId, assignedToId: { in: ids } };
  }
  if (u.role === 'SALES_HEAD') {
    if (!u.teamId) return { assignedToId: u.id };
    const mem = await prisma.user.findMany({
      where: { teamId: u.teamId, organizationId: u.organizationId },
      select: { id: true },
    });
    return { organizationId: u.organizationId, assignedToId: { in: [u.id, ...mem.map(m => m.id)] } };
  }
  return { organizationId: u.organizationId, assignedToId: u.id };
}

async function collectDesc(root: string): Promise<string[]> {
  const out = [root]; const q = [root];
  while (q.length) {
    const cur = q.shift()!;
    const ch = await prisma.user.findMany({ where: { managerId: cur }, select: { id: true } });
    for (const c of ch) { out.push(c.id); q.push(c.id); }
  }
  return out;
}

export const calendarService = {
  async events(req: AuthRequest, from: string, to: string) {
    const scope = await scopeFor(req);
    const fromD = new Date(from);
    const toD = new Date(to);
    if (isNaN(fromD.getTime()) || isNaN(toD.getTime())) {
      throw new Error('Invalid from/to date');
    }

    const [followups, appointments] = await Promise.all([
      prisma.followup.findMany({
        where: { ...scope, dueAt: { gte: fromD, lte: toD } },
        include: {
          lead: { select: { id: true, name: true, phone: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { dueAt: 'asc' },
      }),
      prisma.appointment.findMany({
        where: { ...scope, startAt: { gte: fromD, lte: toD } },
        include: {
          lead: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { startAt: 'asc' },
      }),
    ]);

    const events = [
      ...followups.map(f => ({
        id: f.id,
        type: 'followup' as const,
        title: f.title,
        at: f.dueAt,
        status: f.status,
        relatedName: f.lead?.name ?? null,
        assignedTo: f.assignedTo?.name ?? null,
        leadId: f.leadId,
      })),
      ...appointments.map(a => ({
        id: a.id,
        type: 'appointment' as const,
        title: a.title,
        at: a.startAt,
        endAt: a.endAt,
        status: a.status,
        relatedName: a.lead?.name ?? a.customer?.name ?? null,
        assignedTo: a.assignedTo?.name ?? null,
        leadId: a.leadId,
      })),
    ].sort((x, y) => new Date(x.at).getTime() - new Date(y.at).getTime());

    return { events };
  },
};
