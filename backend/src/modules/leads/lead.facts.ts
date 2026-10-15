import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { buildScopeFilter } from '../../middleware/scope.middleware.js';
import { NotFoundError } from '../../shared/errors.js';

const FINAL = ['WON', 'LOST'];

export async function getLeadFacts(req: AuthRequest, id: string) {
  const scope = await buildScopeFilter(req);

  const lead = await prisma.lead.findFirst({
    where: { id, ...scope.where },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: 'desc' } },
      followups: { orderBy: { dueAt: 'desc' } },
    },
  });

  if (!lead) throw new NotFoundError('Lead not found in your scope');

  const acts = lead.activities;
  const calls = acts.filter((a) => /call/i.test(a.type));
  const wa = acts.filter((a) => /whatsapp/i.test(a.type));
  const fus = acts.filter((a) => /follow.?up/i.test(a.type));

  const lastContact =
    [...calls, ...wa].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0]?.createdAt ?? null;

  const lastResult = fus[0]?.body ?? fus[0]?.title ?? null;

  // Next-action recommendation (rule-based, honest — nothing invented)
  let recommendation = {
    action: 'No action needed',
    reason: 'The lead is closed',
  };

  if (!FINAL.includes(lead.status)) {
    const now = new Date();
    const next = lead.followups.find((f) => f.status === 'PENDING');

    if (!next) {
      recommendation = {
        action: 'Schedule a follow-up',
        reason: 'No follow-up is set',
      };
    } else if (next.dueAt < now) {
      const days = Math.round(
        (now.getTime() - next.dueAt.getTime()) / 86400000
      );
      recommendation = {
        action: 'Call the customer',
        reason: `Follow-up is overdue by ${days} day${days > 1 ? 's' : ''}`,
      };
    } else if (next.dueAt.toDateString() === now.toDateString()) {
      recommendation = {
        action: 'Contact today',
        reason: 'Follow-up is due today',
      };
    } else {
      const days = Math.round(
        (next.dueAt.getTime() - now.getTime()) / 86400000
      );
      recommendation = {
        action: `Contact in ${days} day${days > 1 ? 's' : ''}`,
        reason: 'Follow-up is scheduled',
      };
    }
  }

  // Missing fields (honest — only what's not recorded)
  const missing: string[] = [];
  if (!lead.email) missing.push('email');
  if (!lead.company) missing.push('company');
  if (!lead.notes) missing.push('notes');

  // Build userMap for actor names
  const userIds = new Set<string>();
  acts.forEach((a: any) => a.userId && userIds.add(a.userId));
  const users = userIds.size
    ? await prisma.user.findMany({
        where: { id: { in: [...userIds] } },
        select: { id: true, name: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  return {
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      value: lead.value ? Number(lead.value) : null,
      notes: lead.notes,
      tags: lead.tags ?? [],
      assignedTo: lead.assignedTo,
      createdBy: lead.createdBy,
      customer: lead.customer,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    },
    facts: {
      totalActivities: acts.length,
      callsCount: calls.length,
      whatsappCount: wa.length,
      followupsCount: fus.length,
      lastContactAt: lastContact,
      lastResult,
      missing,
      recommendation,
    },
    activities: acts.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt,
      by: a.userId && userMap.get(a.userId)
        ? { id: a.userId, name: userMap.get(a.userId)! }
        : null,
    })),
    followups: lead.followups.map((f) => ({
      id: f.id,
      title: f.title,
      dueAt: f.dueAt,
      status: f.status,
      result: f.result,
      completedAt: f.completedAt,
    })),
  };
}
