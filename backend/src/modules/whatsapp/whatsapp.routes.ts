import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
  SendMessageSchema,
  ListLogsQuerySchema,
} from './whatsapp.schema.js';
import { whatsappController } from './whatsapp.controller.js';

const router = Router();
router.use(authenticate);

// Templates
router.get('/templates', whatsappController.listTemplates);
router.post('/templates', validate(CreateTemplateSchema), whatsappController.createTemplate);
router.patch('/templates/:id', validate(UpdateTemplateSchema), whatsappController.updateTemplate);
router.delete('/templates/:id', whatsappController.deleteTemplate);

// Send + logs
router.post('/send', validate(SendMessageSchema), whatsappController.send);
router.get('/logs', validate(ListLogsQuerySchema, 'query'), whatsappController.listLogs);

export default router;
