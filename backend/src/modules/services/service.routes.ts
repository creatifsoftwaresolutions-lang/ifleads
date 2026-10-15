import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { AddServiceSchema } from './service.schema.js';
import { serviceController } from './service.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', serviceController.list);
router.post('/', validate(AddServiceSchema), serviceController.add);
router.delete('/:name', serviceController.remove);

export default router;
