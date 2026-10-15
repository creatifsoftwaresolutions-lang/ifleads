import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  ListCustomersQuerySchema,
  ConvertLeadSchema,
} from './customer.schema.js';
import { customerController } from './customer.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('customers:read'),
  validate(ListCustomersQuerySchema, 'query'),
  customerController.list);

router.get('/:id', requirePermission('customers:read'), customerController.getById);

router.post('/', requirePermission('customers:create'),
  validate(CreateCustomerSchema),
  audit('customer.create', 'Customer'),
  customerController.create);

router.patch('/:id', requirePermission('customers:update'),
  validate(UpdateCustomerSchema),
  audit('customer.update', 'Customer'),
  customerController.update);

router.delete('/:id', requirePermission('customers:delete'),
  audit('customer.delete', 'Customer'),
  customerController.remove);

// Convert lead → customer
router.post('/convert-lead/:leadId', requirePermission('customers:create'),
  validate(ConvertLeadSchema),
  audit('customer.convert_lead', 'Customer'),
  customerController.convertLead);

router.post(
  '/sync-converted',
  requirePermission('customers:create'),
  customerController.syncConverted
);

export default router;
