import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { missionsService, missionsServiceExtra } from './missions.service.js';

export const missionsController = {
  async today(req: AuthRequest, res: Response) {
    const data = await missionsService.today(req);
    res.json(data);
  },
  async stats(req: AuthRequest, res: Response) {
    const data = await missionsService.stats(req);
    res.json(data);
  },
  async leaderboard(req: AuthRequest, res: Response) {
    res.json({ data: await missionsServiceExtra.leaderboard(req) });
  },
  async xpHistory(req: AuthRequest, res: Response) {
    res.json({ data: await missionsServiceExtra.xpHistory(req) });
  },
};
