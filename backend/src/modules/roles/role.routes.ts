import { Router } from 'express';
import { AuthRequest, authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { prisma } from '../../config/database.js';

const router = Router();
router.use(authenticate);

// List all roles with permission counts + user counts
router.get('/', requirePermission('roles:read'), async (_req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { level: 'desc' },
    });

    res.json({
      data: roles.map(r => ({
        id: r.id,
        name: r.name,
        level: r.level,
        description: r.description,
        userCount: r._count.users,
        permissionCount: r.permissions.length,
        permissionKeys: r.permissions.map(p => p.permission.key).sort(),
      })),
    });
  } catch (e) { next(e); }
});

// Get a single role's full permission list
router.get('/:id', requirePermission('roles:read'), async (req: AuthRequest, res, next) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { key: 'asc' } },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) return res.status(404).json({ error: 'NOT_FOUND' });

    // Group permissions by module
    const byModule: Record<string, string[]> = {};
    role.permissions.forEach(rp => {
      const m = rp.permission.module;
      if (!byModule[m]) byModule[m] = [];
      byModule[m].push(rp.permission.action);
    });

    res.json({
      data: {
        id: role.id,
        name: role.name,
        level: role.level,
        description: role.description,
        userCount: role._count.users,
        permissionCount: role.permissions.length,
        permissionsByModule: byModule,
      },
    });
  } catch (e) { next(e); }
});

export default router;
