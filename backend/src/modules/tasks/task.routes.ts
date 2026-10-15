import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  MoveTaskSchema,
  ListTasksQuerySchema,
} from './task.schema.js';
import { taskController } from './task.controller.js';
import { taskService } from './task.service.js';

const router = Router();
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════
// SPECIFIC ROUTES FIRST (before /:id wildcard)
// ═══════════════════════════════════════════════════════════════

// Reminders — MUST come before /:id
router.get('/reminders/due', requirePermission('tasks:read'), async (req: any, res, next) => {
  try {
    res.json({ data: await taskService.dueReminders(req) });
  } catch (e) { next(e); }
});

// Checklist item update/delete — also specific
router.patch('/checklist/:itemId', requirePermission('tasks:update'), async (req: any, res, next) => {
  try {
    res.json({ data: await taskService.toggleChecklistItem(req, req.params.itemId, !!req.body.done) });
  } catch (e) { next(e); }
});

router.delete('/checklist/:itemId', requirePermission('tasks:update'), async (req: any, res, next) => {
  try {
    await taskService.deleteChecklistItem(req, req.params.itemId);
    res.status(204).end();
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════
// COLLECTION ROUTES
// ═══════════════════════════════════════════════════════════════

router.get('/', requirePermission('tasks:read'),
  validate(ListTasksQuerySchema, 'query'),
  taskController.list);

router.post('/', requirePermission('tasks:create'),
  validate(CreateTaskSchema),
  audit('task.create', 'Task'),
  taskController.create);

// ═══════════════════════════════════════════════════════════════
// /:id SUB-ROUTES
// ═══════════════════════════════════════════════════════════════

router.get('/:id', requirePermission('tasks:read'), async (req: any, res, next) => {
  try {
    res.json({ data: await taskService.detail(req, req.params.id) });
  } catch (e) { next(e); }
});

router.patch('/:id', requirePermission('tasks:update'),
  validate(UpdateTaskSchema),
  audit('task.update', 'Task'),
  taskController.update);

router.post('/:id/move', requirePermission('tasks:update'),
  validate(MoveTaskSchema),
  audit('task.move', 'Task'),
  taskController.move);

router.post('/:id/reminder-fired', requirePermission('tasks:update'), async (req: any, res, next) => {
  try {
    res.json(await taskService.markReminderFired(req, req.params.id));
  } catch (e) { next(e); }
});

router.post('/:id/comments', requirePermission('tasks:update'), async (req: any, res, next) => {
  try {
    const body = String(req.body?.body ?? '').trim();
    if (!body) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Comment cannot be empty' });
    res.status(201).json({ data: await taskService.addComment(req, req.params.id, body) });
  } catch (e) { next(e); }
});

router.post('/:id/checklist', requirePermission('tasks:update'), async (req: any, res, next) => {
  try {
    const text = String(req.body?.text ?? '').trim();
    if (!text) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Text required' });
    res.status(201).json({ data: await taskService.addChecklistItem(req, req.params.id, text) });
  } catch (e) { next(e); }
});

router.delete('/:id', requirePermission('tasks:delete'),
  audit('task.delete', 'Task'),
  taskController.remove);

export default router;
