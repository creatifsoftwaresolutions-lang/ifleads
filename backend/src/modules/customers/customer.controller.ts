import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { customerService } from './customer.service.js';

export const customerController = {
  async list(req: AuthRequest, res: Response) {
    res.json(await customerService.list(req, req.query as any));
  },
  async getById(req: AuthRequest, res: Response) {
    res.json({ data: await customerService.getById(req, req.params.id) });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await customerService.create(req, req.body) });
  },
  async update(req: AuthRequest, res: Response) {
    res.json({ data: await customerService.update(req, req.params.id, req.body) });
  },
  async remove(req: AuthRequest, res: Response) {
    await customerService.remove(req, req.params.id);
    res.status(204).end();
  },
  async syncConverted(req: AuthRequest, res: Response) {
    const result = await customerService.syncConverted(req);
    res.json({ data: result });
  },
  async convertLead(req: AuthRequest, res: Response) {
    const result = await customerService.convertFromLead(req, req.params.leadId, req.body);
    res.status(201).json(result);
  },
};
