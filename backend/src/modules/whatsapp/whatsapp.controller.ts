import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { whatsappService } from './whatsapp.service.js';

export const whatsappController = {
  async listTemplates(req: AuthRequest, res: Response) {
    res.json({ data: await whatsappService.listTemplates(req) });
  },
  async createTemplate(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await whatsappService.createTemplate(req, req.body) });
  },
  async updateTemplate(req: AuthRequest, res: Response) {
    res.json({ data: await whatsappService.updateTemplate(req, req.params.id, req.body) });
  },
  async deleteTemplate(req: AuthRequest, res: Response) {
    await whatsappService.deleteTemplate(req, req.params.id);
    res.status(204).end();
  },
  async send(req: AuthRequest, res: Response) {
    res.json(await whatsappService.send(req, req.body));
  },
  async listLogs(req: AuthRequest, res: Response) {
    res.json(await whatsappService.listLogs(req, req.query as any));
  },
};
