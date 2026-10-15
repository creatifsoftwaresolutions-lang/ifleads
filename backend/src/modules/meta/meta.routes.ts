import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { verifyWebhook, receiveWebhook } from './meta.webhook.js';
import { metaController } from './meta.controller.js';

const router = Router();

router.get('/webhook', verifyWebhook);
router.post('/webhook', receiveWebhook);

router.get(
  '/status',
  authenticate,
  requirePermission('integrations:read'),
  metaController.status
);

export default router;
