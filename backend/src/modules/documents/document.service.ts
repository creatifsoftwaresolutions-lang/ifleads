import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { NotFoundError } from '../../shared/errors.js';
import type { ListDocumentsQuery } from './document.schema.js';
import path from 'node:path';
import fs from 'node:fs/promises';

function scopeFor(req: AuthRequest): any {
  const u = req.user!;
  if (u.role === 'ADMIN') return {};
  return { organizationId: u.organizationId };
}

function toDTO(d: any) {
  return {
    id: d.id, name: d.name, url: d.url, mimeType: d.mimeType, size: d.size,
    category: (d.metadata as any)?.category ?? null,
    customer: d.customer, createdAt: d.createdAt,
  };
}

export const documentService = {
  async list(req: AuthRequest, q: ListDocumentsQuery) {
    const scope = scopeFor(req);
    const where: any = { ...scope };
    if (q.customerId) where.customerId = q.customerId;
    if (q.search) where.name = { contains: q.search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.document.count({ where }),
    ]);
    return {
      data: data.map(toDTO),
      meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) },
    };
  },

  async create(req: AuthRequest, file: any, input: { category?: string; customerId?: string; name?: string }) {
    const actor = req.user!;
    const url = `/uploads/documents/${file.filename}`;
    const created = await prisma.document.create({
      data: {
        organizationId: actor.organizationId,
        name: input.name || file.originalname,
        url,
        mimeType: file.mimetype,
        size: file.size,
        customerId: input.customerId || null,
        metadata: { category: input.category ?? 'general', uploadedBy: actor.id },
      },
      include: { customer: { select: { id: true, name: true } } },
    });
    await prisma.activity.create({
      data: {
        organizationId: actor.organizationId,
        type: 'document.uploaded',
        title: `Document "${created.name}" uploaded`,
        userId: actor.id,
        customerId: created.customerId,
      },
    });
    return toDTO(created);
  },

  async remove(req: AuthRequest, id: string) {
    const scope = scopeFor(req);
    const existing = await prisma.document.findFirst({ where: { id, ...scope } });
    if (!existing) throw new NotFoundError('Document not found');
    try {
      const filename = existing.url.split('/').pop();
      if (filename) await fs.unlink(path.join(process.cwd(), 'uploads', 'documents', filename));
    } catch {}
    await prisma.document.delete({ where: { id } });
  },
};
