import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { reportsService } from './reports.service.js';

export const reportsController = {
  async overview(req: AuthRequest, res: Response) {
    res.json(await reportsService.overview(req));
  },
};
