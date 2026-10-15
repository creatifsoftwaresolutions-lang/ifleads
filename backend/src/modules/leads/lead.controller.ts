import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { leadService } from './lead.service.js';
import { getLeadFacts } from './lead.facts.js';
import { completeFollowup } from './lead.followup.js';

export const leadController = {
  async create(req: AuthRequest, res: Response) {
    const lead = await leadService.create(req, req.body, req.user!);
    res.status(201).json({ data: lead });
  },

  async list(req: AuthRequest, res: Response) {
    const result = await leadService.list(req, req.query as any);
    res.json(result);
  },

  async getById(req: AuthRequest, res: Response) {
    const lead = await leadService.getById(req, req.params.id);
    res.json({ data: lead });
  },

  async facts(req: AuthRequest, res: Response) {
    const result = await getLeadFacts(req, req.params.id);
    res.json(result);
  },

  async update(req: AuthRequest, res: Response) {
    const lead = await leadService.update(req, req.params.id, req.body);
    res.json({ data: lead });
  },

  async changeStatus(req: AuthRequest, res: Response) {
    const { status, note } = req.body;
    const lead = await leadService.changeStatus(req, req.params.id, status, note);
    res.json({ data: lead });
  },

  async assign(req: AuthRequest, res: Response) {
    const { assignedToId } = req.body;
    const lead = await leadService.assign(req, req.params.id, assignedToId);
    res.json({ data: lead });
  },

  async remove(req: AuthRequest, res: Response) {
    await leadService.remove(req, req.params.id);
    res.status(204).end();
  },

  async bulkAssign(req: AuthRequest, res: Response) {
    const { leadIds, assignedToId } = req.body;
    const result = await leadService.bulkAssign(req, leadIds, assignedToId);
    res.json(result);
  },

  async bulkDelete(req: AuthRequest, res: Response) {
    const { leadIds } = req.body;
    const result = await leadService.bulkDelete(req, leadIds);
    res.json(result);
  },
  async followup(req: AuthRequest, res: Response) {
    const result = await completeFollowup(req, req.params.id, req.body);
    res.json(result);
  },

  async bulkStatus(req: AuthRequest, res: Response) {
    const { leadIds, status } = req.body;
    const result = await leadService.bulkStatus(req, leadIds, status);
    res.json(result);
  },
  async bulkCreate(req: AuthRequest, res: Response) {
    const result = await leadService.bulkCreate(req, req.body);
    res.status(201).json(result);
  },

};
