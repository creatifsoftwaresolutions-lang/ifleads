import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { NotFoundError } from '../../shared/errors.js';
import type { SendMessageInput, CreateTemplateInput, ListLogsQuery } from './whatsapp.schema.js';

function scopeFor(req: AuthRequest): any {
  const u = req.user!;
  if (u.role === 'ADMIN') return {};
  return { organizationId: u.organizationId };
}

/**
 * Templates are stored as Activity rows with:
 *   type = 'wa.template'
 *   title = template name
 *   body = template body
 *   metadata = { category }
 *
 * This avoids a DB migration and reuses the existing Activity table.
 */
export const whatsappService = {
  // ── Templates ──
  async listTemplates(req: AuthRequest) {
    const scope = scopeFor(req);
    const rows = await prisma.activity.findMany({
      where: { ...scope, type: 'wa.template' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      name: r.title,
      body: r.body ?? '',
      category: (r.metadata as any)?.category ?? 'general',
      createdAt: r.createdAt,
    }));
  },

  async createTemplate(req: AuthRequest, input: CreateTemplateInput) {
    const actor = req.user!;
    const created = await prisma.activity.create({
      data: {
        organizationId: actor.organizationId,
        type: 'wa.template',
        title: input.name,
        body: input.body,
        metadata: { category: input.category ?? 'general' },
        userId: actor.id,
      },
    });
    return {
      id: created.id,
      name: created.title,
      body: created.body ?? '',
      category: (created.metadata as any)?.category ?? 'general',
      createdAt: created.createdAt,
    };
  },

  async updateTemplate(req: AuthRequest, id: string, input: Partial<CreateTemplateInput>) {
    const scope = scopeFor(req);
    const existing = await prisma.activity.findFirst({
      where: { id, ...scope, type: 'wa.template' },
    });
    if (!existing) throw new NotFoundError('Template not found');

    const meta: any = { ...((existing.metadata as any) || {}) };
    if (input.category !== undefined) meta.category = input.category;

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: input.name ?? existing.title,
        body: input.body ?? existing.body,
        metadata: meta,
      },
    });
    return {
      id: updated.id,
      name: updated.title,
      body: updated.body ?? '',
      category: meta.category ?? 'general',
      createdAt: updated.createdAt,
    };
  },

  async deleteTemplate(req: AuthRequest, id: string) {
    const scope = scopeFor(req);
    const existing = await prisma.activity.findFirst({
      where: { id, ...scope, type: 'wa.template' },
    });
    if (!existing) throw new NotFoundError('Template not found');
    await prisma.activity.delete({ where: { id } });
  },

  // ── Send + Log ──
  async send(req: AuthRequest, input: SendMessageInput) {
    const actor = req.user!;

    const activity = await prisma.activity.create({
      data: {
        organizationId: actor.organizationId,
        type: 'whatsapp.draft',
        title: 'WhatsApp message to ' + input.phone,
        body: input.message,
        metadata: {
          method: input.method,
          templateId: input.templateId ?? null,
          phone: input.phone,
        },
        userId: actor.id,
        leadId: input.leadId,
        customerId: input.customerId,
      },
    });

    const cleanPhone = input.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
    const waLink = 'https://wa.me/' + intlPhone + '?text=' + encodeURIComponent(input.message);

    return { id: activity.id, waLink, createdAt: activity.createdAt };
  },

  async listLogs(req: AuthRequest, q: ListLogsQuery) {
    const scope = scopeFor(req);
    const where: any = {
      ...scope,
      type: { in: ['whatsapp.draft', 'whatsapp.sent', 'whatsapp.delivered'] },
    };
    if (q.leadId) where.leadId = q.leadId;
    if (q.customerId) where.customerId = q.customerId;

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          lead: { select: { id: true, name: true, phone: true } },
          customer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.activity.count({ where }),
    ]);

    const actorIds = [...new Set(data.map(a => a.userId).filter(Boolean))];
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true },
        })
      : [];
    const actorMap = new Map(actors.map(u => [u.id, u]));

    return {
      data: data.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        body: a.body,
        method: (a.metadata as any)?.method ?? 'click-to-chat',
        lead: a.lead,
        customer: a.customer,
        actor: actorMap.get(a.userId) ?? null,
        createdAt: a.createdAt,
      })),
      meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) },
    };
  },
};
