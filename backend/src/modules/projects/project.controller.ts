import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { projectService } from './project.service.js';

export const projectController = {
  async list(req: AuthRequest, res: Response) { res.json(await projectService.list(req, req.query as any)); },
  async getById(req: AuthRequest, res: Response) { res.json({ data: await projectService.getById(req, req.params.id) }); },
  async create(req: AuthRequest, res: Response) { res.status(201).json({ data: await projectService.create(req, req.body) }); },
  async update(req: AuthRequest, res: Response) { res.json({ data: await projectService.update(req, req.params.id, req.body) }); },
  async remove(req: AuthRequest, res: Response) { await projectService.remove(req, req.params.id); res.status(204).end(); },
};
