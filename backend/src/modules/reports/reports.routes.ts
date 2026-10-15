import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { reportsController } from './reports.controller.js';

const router = Router();
router.use(authenticate);

router.get('/overview', reportsController.overview);

export default router;
