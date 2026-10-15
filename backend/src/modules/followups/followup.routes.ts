import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import {
  ListFollowupsQuerySchema,
  CompleteFollowupSchema,
} from './followup.schema.js';
import { followupController } from './followup.controller.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  requirePermission('followups:read'),
  validate(ListFollowupsQuerySchema, 'query'),
  followupController.list
);

router.post(
  '/:id/complete',
  requirePermission('followups:update'),
  validate(CompleteFollowupSchema),
  audit('followup.complete', 'Followup'),
  followupController.complete
);

export default router;
