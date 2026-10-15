import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  CreateDMSchema,
  CreateGroupSchema,
  SendMessageSchema,
  ListMessagesQuerySchema,
} from './chat.schema.js';
import { chatController } from './chat.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', chatController.list);
router.get('/users', chatController.users);
router.post('/dm', validate(CreateDMSchema), chatController.createDM);
router.post('/group', validate(CreateGroupSchema), chatController.createGroup);
router.get('/:id/messages', validate(ListMessagesQuerySchema, 'query'), chatController.messages);
router.post('/:id/messages', validate(SendMessageSchema), chatController.send);

export default router;
