import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { ChatSchema } from './ai.schema.js';
import { aiController } from './ai.controller.js';

const router = Router();
router.use(authenticate);

router.post('/chat', validate(ChatSchema), aiController.chat);

export default router;
