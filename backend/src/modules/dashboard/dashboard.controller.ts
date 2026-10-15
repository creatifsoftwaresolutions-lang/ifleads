import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async summary(req: AuthRequest, res: Response) {
    const data = await dashboardService.summary(req, req.query as any);
    res.json(data);
  },
};
