import crypto from 'node:crypto';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';

interface MetaLeadField {
  name: string;
  values: string[];
}

interface MetaLeadPayload {
  id?: string;
  field_data?: MetaLeadField[];
  full_name?: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
}

function extractFields(payload: MetaLeadPayload) {
  const out: any = {};
  if (Array.isArray(payload.field_data)) {
    for (const f of payload.field_data) {
      const key = f.name.toLowerCase();
      const val = f.values?.[0];
      if (key.includes('name') && !out.name) out.name = val;
      else if (key.includes('email')) out.email = val;
      else if (key.includes('phone')) out.phone = val;
      else if (key.includes('company')) out.company = val;
    }
  }
  if (!out.name && payload.full_name) out.name = payload.full_name;
  if (!out.email && payload.email) out.email = payload.email;
  if (!out.phone && payload.phone_number) out.phone = payload.phone_number;
  if (!out.company && payload.company_name) out.company = payload.company_name;
  return out;
}

export const metaService = {
  verifyWebhook(mode: string, token: string, challenge: string) {
    if (mode !== 'subscribe') throw new Error('Invalid mode');
    if (token !== env.META_VERIFY_TOKEN) throw new Error('Invalid verify token');
    return challenge;
  },

  verifySignature(rawBody: string, signature: string): boolean {
    if (!env.META_APP_SECRET) return true;
    const expected =
      'sha256=' +
      crypto.createHmac('sha256', env.META_APP_SECRET).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  },

  async receiveLead(organizationId: string, payload: MetaLeadPayload, source: 'facebook' | 'instagram' = 'facebook') {
    const fields = extractFields(payload);
    if (!fields.name) throw new Error('Lead has no name');

    const admin = await prisma.user.findFirst({
      where: { organizationId, role: { name: 'ADMIN' } },
    });
    if (!admin) throw new Error('No admin user for organization');

    if (fields.phone || fields.email) {
      const existing = await prisma.lead.findFirst({
        where: {
          organizationId,
          OR: [
            fields.phone ? { phone: fields.phone } : {},
            fields.email ? { email: fields.email } : {},
          ].filter((x) => Object.keys(x).length > 0),
        },
      });
      if (existing) return { created: false, reason: 'duplicate', leadId: existing.id };
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        name: fields.name,
        email: fields.email || null,
        phone: fields.phone || null,
        company: fields.company || null,
        source,
        status: 'NEW',
        priority: 'MEDIUM',
        assignedToId: admin.id,
        createdById: admin.id,
      },
    });

    await prisma.activity.create({
      data: {
        organizationId,
        type: 'Lead created',
        title: `Lead captured from Meta (${source})`,
        body: `Imported via ${source} Lead Ads`,
        userId: admin.id,
        leadId: lead.id,
      },
    });

    return { created: true, leadId: lead.id };
  },

  async status(organizationId: string) {
    const configured = Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_VERIFY_TOKEN);
    const metaLeads = await prisma.lead.count({
      where: { organizationId, source: { in: ['facebook', 'instagram'] } },
    });
    return {
      configured,
      appId: env.META_APP_ID ? env.META_APP_ID.slice(0, 8) + '...' : null,
      webhookUrl: `${env.API_URL}/api/meta/webhook`,
      verifyToken: env.META_VERIFY_TOKEN ? '********' : null,
      metaLeadsCount: metaLeads,
      recentLeads: await prisma.lead.findMany({
        where: { organizationId, source: { in: ['facebook', 'instagram'] } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, source: true, createdAt: true },
      }),
    };
  },
};
