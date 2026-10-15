import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { appointmentService } from './appointment.service.js';

export const appointmentController = {
  async list(req: AuthRequest, res: Response) {
    res.json(await appointmentService.list(req, req.query as any));
  },
  async getById(req: AuthRequest, res: Response) {
    res.json({ data: await appointmentService.getById(req, req.params.id) });
  },
  async availability(req: AuthRequest, res: Response) {
    res.json({
      data: await appointmentService.availability(req, req.query as any),
    });
  },
  async create(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await appointmentService.create(req, req.body) });
  },
  async approve(req: AuthRequest, res: Response) {
    res.json({ data: await appointmentService.approve(req, req.params.id) });
  },
  async decline(req: AuthRequest, res: Response) {
    res.json({
      data: await appointmentService.decline(req, req.params.id, req.body?.reason),
    });
  },
  async cancel(req: AuthRequest, res: Response) {
    res.json({ data: await appointmentService.cancel(req, req.params.id) });
  },
  async block(req: AuthRequest, res: Response) {
    res.status(201).json({ data: await appointmentService.block(req, req.body) });
  },
  async unblock(req: AuthRequest, res: Response) {
    res.json(await appointmentService.unblock(req, req.params.id));
  },
  async listBlocks(req: AuthRequest, res: Response) {
    const { from, to } = req.query as any;
    res.json({
      data: await appointmentService.listBlocks(req, from, to),
    });
  },
};
