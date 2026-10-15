import { Router } from 'express';
import { AuthRequest, authenticate } from '../../middleware/auth.middleware.js';
import { calendarService } from './calendar.service.js';

const router = Router();
router.use(authenticate);

router.get('/events', async (req: AuthRequest, res, next) => {
  try {
    const from = String(req.query.from ?? '');
    const to = String(req.query.to ?? '');
    const result = await calendarService.events(req, from, to);
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
