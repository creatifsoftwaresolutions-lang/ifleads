import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { SummaryQuerySchema } from './dashboard.schema.js';
import { dashboardController } from './dashboard.controller.js';

const router = Router();
router.use(authenticate);

router.get('/summary', validate(SummaryQuerySchema, 'query'), dashboardController.summary);

export default router;
