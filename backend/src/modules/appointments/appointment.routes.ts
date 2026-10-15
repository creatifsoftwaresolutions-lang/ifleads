import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  AvailabilityQuerySchema,
  BlockSchema,
  CreateAppointmentSchema,
  DeclineSchema,
  ListAppointmentsQuerySchema,
} from './appointment.schema.js';
import { appointmentController } from './appointment.controller.js';

const router = Router();
router.use(authenticate);

// ── Static routes FIRST (before :id) ──
router.get(
  '/availability',
  validate(AvailabilityQuerySchema, 'query'),
  appointmentController.availability
);

router.get(
  '/blocks',
  appointmentController.listBlocks
);

router.post(
  '/block',
  validate(BlockSchema),
  appointmentController.block
);

router.delete(
  '/block/:id',
  appointmentController.unblock
);

// ── Main CRUD ──
router.get(
  '/',
  validate(ListAppointmentsQuerySchema, 'query'),
  appointmentController.list
);

router.post(
  '/',
  validate(CreateAppointmentSchema),
  appointmentController.create
);

router.get('/:id', appointmentController.getById);

router.post('/:id/approve', appointmentController.approve);
router.post('/:id/decline', validate(DeclineSchema), appointmentController.decline);
router.post('/:id/cancel', appointmentController.cancel);

export default router;
