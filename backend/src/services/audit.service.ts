import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export function audit(action: string, entityType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      if (res.statusCode < 400) {
        const entityId =
          body?.data?.id ?? req.params.id ?? req.params.teamId ?? null;

        prisma.auditLog
          .create({
            data: {
              userId: req.user?.id,
              action,
              entityType,
              entityId,
              metadata: {
                method: req.method,
                path: req.originalUrl,
                body: redact(req.body),
              },
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
            },
          })
          .catch((err) => console.error('[audit]', err));
      }
      return originalJson(body);
    };

    next();
  };
}

function redact(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of [
    'password',
    'newPassword',
    'currentPassword',
    'refresh_token',
    'access_token',
  ]) {
    if (key in clone) clone[key] = '***';
  }
  return clone;
}

export const auditService = {
  async list(params: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    from?: Date;
    to?: Date;
    skip: number;
    take: number;
  }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = { contains: params.action };
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  },
};
