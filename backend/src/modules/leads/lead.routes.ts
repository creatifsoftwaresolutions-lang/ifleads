import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  AssignLeadSchema,
  UpdateLeadStatusSchema,
  ListLeadsQuerySchema,
  BulkAssignSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  CompleteFollowupSchema,
  BulkCreateLeadsSchema,
} from './lead.schema.js';
import { leadController } from './lead.controller.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  requirePermission('leads:read'),
  validate(ListLeadsQuerySchema, 'query'),
  leadController.list
);

router.get(
  '/:id',
  requirePermission('leads:read'),
  leadController.getById
);

router.get(
  '/:id/facts',
  requirePermission('leads:read'),
  leadController.facts
);

router.post(
  '/',
  requirePermission('leads:create'),
  validate(CreateLeadSchema),
  audit('lead.create', 'Lead'),
  leadController.create
);

router.patch(
  '/:id',
  requirePermission('leads:update'),
  validate(UpdateLeadSchema),
  audit('lead.update', 'Lead'),
  leadController.update
);

router.post(
  '/:id/status',
  requirePermission('leads:update'),
  validate(UpdateLeadStatusSchema),
  audit('lead.status_change', 'Lead'),
  leadController.changeStatus
);

router.post(
  '/:id/assign',
  requirePermission('leads:assign'),
  validate(AssignLeadSchema),
  audit('lead.assign', 'Lead'),
  leadController.assign
);

router.delete(
  '/:id',
  requirePermission('leads:delete'),
  audit('lead.delete', 'Lead'),
  leadController.remove
);

router.post(
  '/bulk/assign',
  requirePermission('leads:assign'),
  validate(BulkAssignSchema),
  audit('lead.bulk_assign', 'Lead'),
  leadController.bulkAssign
);

router.post(
  '/bulk/status',
  requirePermission('leads:update'),
  validate(BulkStatusSchema),
  audit('lead.bulk_status', 'Lead'),
  leadController.bulkStatus
);

router.post(
  '/bulk/delete',
  requirePermission('leads:delete'),
  validate(BulkDeleteSchema),
  audit('lead.bulk_delete', 'Lead'),
  leadController.bulkDelete
);

router.post(
  '/:id/followup',
  requirePermission('followups:create'),
  validate(CompleteFollowupSchema),
  audit('lead.followup', 'Lead'),
  leadController.followup
);

router.post(
  '/bulk',
  requirePermission('leads:create'),
  validate(BulkCreateLeadsSchema),
  leadController.bulkCreate
);

export default router;
