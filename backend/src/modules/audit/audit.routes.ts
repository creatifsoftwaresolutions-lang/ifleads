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
    if (actor.role !== 'ADMIN') where.user = { organizationId: actor.organizationId };
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
        include: { user: { select: { id: true, name: true, email: true, role: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: data.map(a => ({
        id: a.id, action: a.action, entityType: a.entityType, entityId: a.entityId,
        metadata: a.metadata, ipAddress: a.ipAddress, userAgent: a.userAgent,
        createdAt: a.createdAt,
        actor: a.user ? { id: a.user.id, name: a.user.name, email: a.user.email, role: a.user.role?.name } : null,
      })),
      meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) },
    });
  } catch (e) { next(e); }
});

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

// ── Attendance with full sessions per user per day ──
router.get('/attendance', requirePermission('audit:read'), async (req: AuthRequest, res, next) => {
  try {
    const actor = req.user!;
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(new Date().setHours(0, 0, 0, 0));

    const scopedUserIds = await getScopedUserIds(actor);

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['auth.login', 'auth.logout'] },
        createdAt: { gte: from, lte: to },
        userId: { in: scopedUserIds },
      },
      include: {
        user: {
          select: {
            id: true, name: true, email: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, any> = {};
    for (const log of logs) {
      if (!log.user) continue;
      const day = log.createdAt.toISOString().slice(0, 10);
      const key = `${log.userId}|${day}`;
      if (!grouped[key]) {
        grouped[key] = {
          userId: log.userId,
          name: log.user.name,
          email: log.user.email,
          role: log.user.role?.name ?? '',
          date: day,
          sessions: [] as { login: string; logout: string | null }[],
        };
      }
      if (log.action === 'auth.login') {
        grouped[key].sessions.push({ login: log.createdAt, logout: null });
      } else if (log.action === 'auth.logout') {
        const last = grouped[key].sessions[grouped[key].sessions.length - 1];
        if (last && !last.logout) last.logout = log.createdAt;
      }
    }

    const rows = Object.values(grouped).map((r: any) => {
      const sessions = r.sessions;
      const firstLogin = sessions[0]?.login ?? null;
      const lastLogout = sessions.filter((s: any) => s.logout).slice(-1)[0]?.logout ?? null;
      const isOnline = sessions.length > 0 && sessions[sessions.length - 1].logout === null;

      let totalMs = 0;
      for (const s of sessions) {
        if (s.login && s.logout) {
          totalMs += new Date(s.logout).getTime() - new Date(s.login).getTime();
        }
      }
      const hours = totalMs > 0 ? totalMs / 3600000 : null;

      return {
        userId: r.userId,
        name: r.name,
        email: r.email,
        role: r.role,
        date: r.date,
        firstLogin,
        lastLogout,
        loginCount: sessions.length,
        hours,
        isOnline,
        sessions,
      };
    }).sort((a: any, b: any) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));

    const uniqueUsers = new Set(rows.map((r: any) => r.userId)).size;
    const onlineNow = rows.filter((r: any) => r.isOnline).length;
    const totalHours = rows.reduce((sum: number, r: any) => sum + (r.hours ?? 0), 0);
    const avgHours = uniqueUsers > 0 ? totalHours / uniqueUsers : 0;

    res.json({
      data: rows,
      summary: {
        totalStaff: uniqueUsers,
        onlineNow,
        totalHours: Math.round(totalHours * 100) / 100,
        avgHours: Math.round(avgHours * 100) / 100,
      },
    });
  } catch (e) { next(e); }
});

async function getScopedUserIds(actor: any): Promise<string[]> {
  if (!actor) return [];
  if (actor.role === 'ADMIN' || actor.role === 'CEO' || actor.role === 'BDM') {
    const all = await prisma.user.findMany({
      where: { organizationId: actor.organizationId },
      select: { id: true },
    });
    return all.map((u) => u.id);
  }
  if (actor.role === 'BDE') return [actor.id];

  // SALES_HEAD → self + team
  const all = await prisma.user.findMany({
    where: { organizationId: actor.organizationId },
    select: { id: true, managerId: true, teamId: true },
  });
  const result = new Set<string>([actor.id]);
  if (actor.teamId) {
    for (const u of all) if (u.teamId === actor.teamId) result.add(u.id);
  }
  return [...result];
}

export default router;
