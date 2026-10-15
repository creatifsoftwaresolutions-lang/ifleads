import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { notificationService } from './notification.service.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const onlyUnread = req.query.unread === 'true';
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const result = await notificationService.list(req.user!.id, { onlyUnread, limit });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.markRead(req.params.id, req.user!.id);
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/read-all', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user!.id);
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
