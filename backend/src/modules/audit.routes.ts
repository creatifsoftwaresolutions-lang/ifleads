import { Router } from 'express';
import { AuthRequest, authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { prisma } from '../../config/database.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(200).default(50),
  action: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

router.get('/', requirePermission('audit:read'), async (req: AuthRequest, res, next) => {
  try {
    const q = QuerySchema.parse(req.query);
    const actor = req.user!;

    const where: any = {};
    // Scope by organization — admin sees all, others see their org only
    if (actor.role !== 'ADMIN') {
      where.user = { organizationId: actor.organizationId };
    }
    if (q.action) where.action = { contains: q.action, mode: 'insensitive' };
    if (q.entityType) where.entityType = q.entityType;
    if (q.userId) where.userId = q.userId;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: data.map(a => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        metadata: a.metadata,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt,
        actor: a.user
          ? { id: a.user.id, name: a.user.name, email: a.user.email, role: a.user.role?.name }
          : null,
      })),
      meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) },
    });
  } catch (e) { next(e); }
});

// Distinct actions for filter dropdown
router.get('/actions', requirePermission('audit:read'), async (req: AuthRequest, res, next) => {
  try {
    const actor = req.user!;
    const rows = await prisma.auditLog.findMany({
      where: actor.role === 'ADMIN' ? {} : { user: { organizationId: actor.organizationId } },
      select: { action: true },
      distinct: ['action'],
      take: 200,
    });
    res.json({ data: rows.map(r => r.action).sort() });
  } catch (e) { next(e); }
});

export default router;
