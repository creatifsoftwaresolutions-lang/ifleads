import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors.js';
import type { AuthRequest } from '../../middleware/auth.middleware.js';

export const serviceService = {
  async list(req: AuthRequest) {
    const org = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: { services: true },
    });
    return org?.services ?? [];
  },

  async add(req: AuthRequest, name: string) {
    const org = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: { services: true },
    });
    if (!org) throw new NotFoundError('Organization not found');
    if (org.services.includes(name)) return org.services;

    const updated = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: { services: [...org.services, name] },
      select: { services: true },
    });
    return updated.services;
  },

  async remove(req: AuthRequest, name: string) {
    const org = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: { services: true },
    });
    if (!org) throw new NotFoundError('Organization not found');

    const updated = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: { services: org.services.filter((s) => s !== name) },
      select: { services: true },
    });
    return updated.services;
  },
};
