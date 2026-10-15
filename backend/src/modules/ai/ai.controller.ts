import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { aiService } from './ai.service.js';

export const aiController = {
  async chat(req: AuthRequest, res: Response) {
    const { message } = req.body;
    const reply = await aiService.chat(req, message);
    res.json(reply);
  },
};
