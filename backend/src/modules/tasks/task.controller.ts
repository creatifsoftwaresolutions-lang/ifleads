import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { taskService } from './task.service.js';

export const taskController = {
  async list(req: AuthRequest, res: Response) {
    res.json(await taskService.list(req, req.query as any));
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await taskService.create(req, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    res.json({ data: await taskService.update(req, req.params.id, req.body) });
  },
  async move(req: AuthRequest, res: Response) {
    res.json({ data: await taskService.move(req, req.params.id, req.body.status) });
  },
  async remove(req: AuthRequest, res: Response) {
    await taskService.remove(req, req.params.id);
    res.status(204).end();
  },
};
