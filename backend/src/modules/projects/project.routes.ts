import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import { CreateProjectSchema, UpdateProjectSchema, ListProjectsQuerySchema } from './project.schema.js';
import { projectController } from './project.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('projects:read'),
  validate(ListProjectsQuerySchema, 'query'), projectController.list);
router.get('/:id', requirePermission('projects:read'), projectController.getById);
router.post('/', requirePermission('projects:create'),
  validate(CreateProjectSchema),
  audit('project.create', 'Project'),
  projectController.create);
router.patch('/:id', requirePermission('projects:update'),
  validate(UpdateProjectSchema),
  audit('project.update', 'Project'),
  projectController.update);
router.delete('/:id', requirePermission('projects:delete'),
  audit('project.delete', 'Project'), projectController.remove);

export default router;
