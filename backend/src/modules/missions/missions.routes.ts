import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { missionsController } from './missions.controller.js';

const router = Router();
router.use(authenticate);

router.get(
  '/today',
  requirePermission('followups:read'),
  missionsController.today
);
router.get(
  '/stats',
  requirePermission('followups:read'),
  missionsController.stats
);


router.get(
  '/leaderboard',
  requirePermission('followups:read'),
  missionsController.leaderboard,
);

router.get(
  '/history',
  requirePermission('followups:read'),
  missionsController.xpHistory,
);

export default router;
