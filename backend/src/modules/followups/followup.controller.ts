import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { followupService } from './followup.service.js';

export const followupController = {
  async list(req: AuthRequest, res: Response) {
    const result = await followupService.list(req, req.query as any);
    res.json(result);
  },
  async complete(req: AuthRequest, res: Response) {
    const result = await followupService.complete(req, req.params.id, req.body);
    res.json(result);
  },
};
