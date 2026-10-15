import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { NotFoundError } from '../../shared/errors.js';
import type { CreateProjectInput, UpdateProjectInput, ListProjectsQuery } from './project.schema.js';

function scopeFor(req: AuthRequest): any {
  const u = req.user!;
  if (u.role === 'ADMIN') return {};
  return { organizationId: u.organizationId };
}

function toDTO(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    priority: p.priority,
    startDate: p.startDate,
    targetDate: p.targetDate,
    completedAt: p.completedAt,
    customer: p.customer,
    createdAt: p.createdAt,
  };
}

export const projectService = {
  async list(req: AuthRequest, q: ListProjectsQuery) {
    const scope = scopeFor(req);
    const where: any = { ...scope };
    if (q.status) where.status = q.status;
    if (q.customerId) where.customerId = q.customerId;
    if (q.search) where.name = { contains: q.search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.project.count({ where }),
    ]);
    return {
      data: data.map(toDTO),
      meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) },
    };
  },

  async getById(req: AuthRequest, id: string) {
    const scope = scopeFor(req);
    const p = await prisma.project.findFirst({
      where: { id, ...scope },
      include: { customer: { select: { id: true, name: true, phone: true, email: true } } },
    });
    if (!p) throw new NotFoundError('Project not found');
    return toDTO(p);
  },

  async create(req: AuthRequest, input: CreateProjectInput) {
    const actor = req.user!;
    const created = await prisma.project.create({
      data: {
        organizationId: actor.organizationId,
        name: input.name,
        description: input.description,
        status: input.status ?? 'NEW',
        priority: input.priority ?? 'MEDIUM',
        customerId: input.customerId,
        startDate: input.startDate ? new Date(input.startDate) : null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    return toDTO(created);
  },

  async update(req: AuthRequest, id: string, input: UpdateProjectInput) {
    const scope = scopeFor(req);
    const existing = await prisma.project.findFirst({ where: { id, ...scope } });
    if (!existing) throw new NotFoundError('Project not found');

    const data: any = { ...input };
    if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.targetDate !== undefined) data.targetDate = input.targetDate ? new Date(input.targetDate) : null;
    if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') data.completedAt = new Date();

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: { customer: { select: { id: true, name: true } } },
    });
    return toDTO(updated);
  },

  async remove(req: AuthRequest, id: string) {
    const scope = scopeFor(req);
    const existing = await prisma.project.findFirst({ where: { id, ...scope } });
    if (!existing) throw new NotFoundError('Project not found');
    await prisma.project.delete({ where: { id } });
  },
};

export const STATUS_LIST = ['NEW','PLANNING','IN_PROGRESS','WAITING_FOR_CUSTOMER','REVIEW','COMPLETED','CANCELLED'];
