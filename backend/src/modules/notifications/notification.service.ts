import { prisma } from '../../config/database.js';

export const notificationService = {
  async list(userId: string, opts: { limit?: number; onlyUnread?: boolean } = {}) {
    const where: any = { userId };
    if (opts.onlyUnread) where.readAt = null;

    const [data, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: opts.limit ?? 20,
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return { data, unreadCount };
  },

  async markRead(id: string, userId: string) {
    const r = await prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { updated: r.count };
  },

  async markAllRead(userId: string) {
    const r = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: r.count };
  },

  async create(data: {
    organizationId: string;
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: any;
  }) {
    return prisma.notification.create({ data });
  },
};
