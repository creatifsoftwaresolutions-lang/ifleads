import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';

export const leadRepository = {
  async findById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        followups: {
          orderBy: { dueAt: 'desc' },
          take: 1,
          select: { dueAt: true, status: true },
        },
      },
    });
  },

  async list(params: {
    where: Prisma.LeadWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.LeadOrderByWithRelationInput;
  }) {
    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          followups: {
            orderBy: { dueAt: 'desc' },
            take: 1,
            select: { dueAt: true, status: true },
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true, userId: true, type: true, title: true },
          },
        },
      }),
      prisma.lead.count({ where: params.where }),
    ]);
    return { data, total };
  },

  async counts(where: Prisma.LeadWhereInput) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [all, mine, hot, overdue, won, lost] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({
        where: { ...where, assignedToId: (where as any).assignedToId },
      }),
      prisma.lead.count({ where: { ...where, priority: 'HOT' } }),
      prisma.lead.count({
        where: {
          ...where,
          followups: {
            some: { dueAt: { lt: startOfToday }, status: 'PENDING' },
          },
        },
      }),
      prisma.lead.count({ where: { ...where, status: 'WON' } }),
      prisma.lead.count({ where: { ...where, status: 'LOST' } }),
    ]);

    return { all, mine, hot, overdue, won, lost };
  },

  async findDuplicates(
    organizationId: string,
    email?: string,
    phone?: string
  ) {
    if (!email && !phone) return [];
    return prisma.lead.findMany({
      where: {
        organizationId,
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 5,
    });
  },

  async create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({ data });
  },

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.lead.delete({ where: { id } });
  },

  async bulkAssign(ids: string[], assignedToId: string | null) {
    return prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { assignedToId },
    });
  },

  async bulkDelete(ids: string[]) {
    return prisma.lead.deleteMany({ where: { id: { in: ids } } });
  },
};
