import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { metaService } from './meta.service.js';

export const metaController = {
  async status(req: AuthRequest, res: Response) {
    const status = await metaService.status(req.user!.organizationId);
    res.json({ data: status });
  },
};
