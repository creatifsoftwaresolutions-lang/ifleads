import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';

function toDTO(c: any) {
  return {
    id: c.id,
    type: c.type,
    name: c.name,
    color: c.color,
    order: c.order,
    createdAt: c.createdAt,
  };
}

export const configService = {
  async list(req: AuthRequest, type: string) {
    const actor = req.user!;
    const rows = await prisma.configItem.findMany({
      where: { organizationId: actor.organizationId, type },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toDTO);
  },

  async create(req: AuthRequest, input: { type: string; name: string; color?: string; order?: number }) {
    const actor = req.user!;

    // Check for duplicates
    const existing = await prisma.configItem.findFirst({
      where: {
        organizationId: actor.organizationId,
        type: input.type,
        name: { equals: input.name, mode: 'insensitive' },
      },
    });
    if (existing) throw new ConflictError(`"${input.name}" already exists in this category`);

    const created = await prisma.configItem.create({
      data: {
        organizationId: actor.organizationId,
        type: input.type,
        name: input.name,
        color: input.color ?? null,
        order: input.order ?? 0,
        createdById: actor.id,
      },
    });
    return toDTO(created);
  },

  async update(req: AuthRequest, id: string, input: { name?: string; color?: string; order?: number }) {
    const actor = req.user!;
    const existing = await prisma.configItem.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!existing) throw new NotFoundError('Config item not found');

    const updated = await prisma.configItem.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        color: input.color !== undefined ? input.color : existing.color,
        order: input.order ?? existing.order,
      },
    });
    return toDTO(updated);
  },

  async remove(req: AuthRequest, id: string) {
    const actor = req.user!;
    const existing = await prisma.configItem.findFirst({
      where: { id, organizationId: actor.organizationId },
    });
    if (!existing) throw new NotFoundError('Config item not found');
    await prisma.configItem.delete({ where: { id } });
  },
};
