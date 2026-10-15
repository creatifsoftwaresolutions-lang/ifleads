import { prisma } from '../config/database.js';
import { customerService } from '../modules/customers/customer.service.js';

const INTERVAL_MS = 15_000;

async function scanAndConvert() {
  try {
    const wonLeads = await prisma.lead.findMany({
      where: { status: 'WON', customerId: null },
      select: {
        id: true,
        name: true,
        organizationId: true,
        assignedToId: true,
        createdById: true,
      },
      take: 50,
    });

    if (wonLeads.length === 0) return;

    console.log(
      `[auto-convert worker] found ${wonLeads.length} WON lead(s) without customers`
    );

    for (const lead of wonLeads) {
      try {
        const userId = lead.assignedToId ?? lead.createdById;
        if (!userId) {
          console.warn(`[auto-convert worker] no user for "${lead.name}"`);
          continue;
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, organizationId: true, roleId: true },
        });
        if (!user) continue;

        const role = await prisma.role.findUnique({
          where: { id: user.roleId },
          select: { name: true },
        });

        const fakeReq: any = {
          user: {
            id: user.id,
            name: user.name,
            organizationId: lead.organizationId,
            role: role?.name ?? 'ADMIN',
          },
        };

        await customerService.convertFromLead(fakeReq, lead.id, {});
        console.log(`[auto-convert worker] ✅ converted "${lead.name}"`);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.toLowerCase().includes('already converted')) continue;
        console.error(`[auto-convert worker] failed for "${lead.name}":`, msg);
      }
    }
  } catch (e) {
    console.error('[auto-convert worker] scan failed:', e);
  }
}

export function startAutoConvertWorker() {
  // Run once immediately
  scanAndConvert();
  // Then every 15s
  setInterval(scanAndConvert, INTERVAL_MS);
  console.log('[auto-convert worker] started (every 15s)');
}
