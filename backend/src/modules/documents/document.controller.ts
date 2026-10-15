import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { documentService } from './document.service.js';

export const documentController = {
  async list(req: AuthRequest, res: Response) {
    res.json(await documentService.list(req, req.query as any));
  },
  async create(req: AuthRequest, res: Response) {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded' });
    const created = await documentService.create(req, req.file, {
      category: req.body.category,
      customerId: req.body.customerId,
      name: req.body.name,
    });
    res.status(201).json({ data: created });
  },
  async remove(req: AuthRequest, res: Response) {
    await documentService.remove(req, req.params.id);
    res.status(204).end();
  },
};
