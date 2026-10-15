import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { serviceService } from './service.service.js';

export const serviceController = {
  async list(req: AuthRequest, res: Response) {
    res.json({ data: await serviceService.list(req) });
  },
  async add(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await serviceService.add(req, req.body.name) });
  },
  async remove(req: AuthRequest, res: Response) {
    res.json({ data: await serviceService.remove(req, req.params.name) });
  },
};
