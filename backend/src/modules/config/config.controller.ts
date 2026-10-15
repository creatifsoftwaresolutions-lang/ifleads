import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { configService } from './config.service.js';

export const configController = {
  async list(req: AuthRequest, res: Response) {
    const { type } = req.query as any;
    res.json({ data: await configService.list(req, type) });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await configService.create(req, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    res.json({ data: await configService.update(req, req.params.id, req.body) });
  },
  async remove(req: AuthRequest, res: Response) {
    await configService.remove(req, req.params.id);
    res.status(204).end();
  },
};
