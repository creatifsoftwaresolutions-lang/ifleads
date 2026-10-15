import { Request, Response } from 'express';
import { metaService } from './meta.service.js';
import { prisma } from '../../config/database.js';

export async function verifyWebhook(req: Request, res: Response) {
  try {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;
    res.status(200).send(metaService.verifyWebhook(mode, token, challenge));
  } catch (err: any) {
    res.status(403).send(err.message || 'Forbidden');
  }
}

export async function receiveWebhook(req: Request, res: Response) {
  res.status(200).send('EVENT_RECEIVED');
  try {
    const payload = req.body;
    if (payload.object !== 'page' && payload.object !== 'instagram') return;
    const source = payload.object === 'instagram' ? 'instagram' : 'facebook';
    const org = await prisma.organization.findFirst();
    if (!org) return;
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;
        try {
          const result = await metaService.receiveLead(org.id, value, source);
          console.log('[meta] Lead processed:', result);
        } catch (err) {
          console.error('[meta] Failed:', err);
        }
      }
    }
  } catch (err) {
    console.error('[meta] Webhook error:', err);
  }
}
