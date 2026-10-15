import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { chatService } from './chat.service.js';

export const chatController = {
  async list(req: AuthRequest, res: Response) {
    res.json({ data: await chatService.listChats(req) });
  },
  async users(req: AuthRequest, res: Response) {
    res.json({ data: await chatService.listUsers(req) });
  },
  async createDM(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await chatService.getOrCreateDM(req, req.body.userId) });
  },
  async createGroup(req: AuthRequest, res: Response) {
    const { name, memberIds } = req.body;
    res.status(201).json({ data: await chatService.createGroup(req, name, memberIds) });
  },
  async messages(req: AuthRequest, res: Response) {
    const { limit } = req.query as any;
    res.json({ data: await chatService.listMessages(req, req.params.id, Number(limit) || 100) });
  },
  async send(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await chatService.sendMessage(req, req.params.id, req.body.body) });
  },
};
