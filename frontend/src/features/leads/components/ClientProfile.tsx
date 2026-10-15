import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Phone, MessageCircle, User, Calendar, Sparkles,
  LayoutList, Activity as ActivityIcon, Clock, FileText,
  CheckSquare, CalendarCheck, Shield, UserCheck,
} from 'lucide-react';
import { leadsService, LeadFactsResponse } from '../services/leads.service';
import { Badge, statusColor } from '@/components/ui/Badge';
import { FollowUpModal } from './FollowUpModal';
import { cn } from '@/shared/utils/cn';
import { api } from '@/shared/api/client';

interface Props {
  leadId: string | null;
  onClose: () => void;
}

type Tab =
  | 'overview'
  | 'activity'
  | 'followups'
  | 'timeline'
  | 'tasks'
  | 'appointments'
  | 'audit';

const TABS: { id: Tab; label: string; icon: typeof LayoutList }[] = [
  { id: 'overview',     label: 'Overview',     icon: LayoutList },
  { id: 'activity',     label: 'Activity',     icon: ActivityIcon },
  { id: 'followups',    label: 'Follow-ups',   icon: Clock },
  { id: 'timeline',     label: 'Timeline',     icon: FileText },
  { id: 'tasks',        label: 'Tasks',        icon: CheckSquare },
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
  { id: 'audit',        label: 'Audit',        icon: Shield },
];

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function daysUntil(d: string) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  return Math.round((x.getTime() - t.getTime()) / 86400000);
}

export function ClientProfile({ leadId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [followupOpen, setFollowupOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (leadId) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [leadId, onClose]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead-facts', leadId],
    queryFn: () => leadsService.facts(leadId!),
    enabled: !!leadId,
  });

  if (!leadId) return null;

  const callLead = () => {
    if (!data?.lead.phone) return;
    window.location.href = `tel:+${data.lead.phone.replace(/\D/g, '')}`;
  };

  const waLead = () => {
    if (!data?.lead.phone) return;
    const num = data.lead.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hi ${data.lead.name},\n\nI'm following up regarding your enquiry.\n\nRegards,\nTeam`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank', 'noopener');
  };

  const handleConvert = async () => {
    if (!leadId || converting) return;
    if (!confirm('Convert this lead to a customer?')) return;
    setConverting(true);
    try {
      await api.post(`/customers/convert-lead/${leadId}`, {});
      queryClient.invalidateQueries({ queryKey: ['lead-facts', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      alert('Converted to customer ✅');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleFollowupSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['lead-facts', leadId] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[760px]
                   bg-ink-bg overflow-hidden shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Client profile"
      >
        {/* Header */}
        <div className="bg-white border-b border-ink-border
                        flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand" />
            <h2 className="text-base font-semibold text-ink">
              {data?.lead.name ?? 'Client Profile'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {data?.lead && !(data.lead as any).customerId && (
              <button
                onClick={handleConvert}
                disabled={converting}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-brand text-white text-[12.5px] font-medium hover:bg-brand-hover disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {converting ? 'Converting…' : 'Convert to Customer'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md
                         text-ink-muted hover:bg-brand-light hover:text-brand transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs bar */}
        {data && (
          <div className="bg-white border-b border-ink-border overflow-x-auto shrink-0">
            <div className="flex px-3">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium',
                      'border-b-2 -mb-px transition-colors whitespace-nowrap',
                      tab === t.id
                        ? 'border-brand text-brand'
                        : 'border-transparent text-ink-muted hover:text-ink'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="text-center py-12 text-sm text-ink-muted">
              Loading client profile…
            </div>
          )}

          {error && (
            <div className="bg-white border border-danger/30 rounded-xl p-6 text-center">
              <p className="text-sm text-danger">
                Failed to load. Is the backend running?
              </p>
            </div>
          )}

          {data && (
            <>
              {/* Identity + action buttons (always visible) */}
              <div className="bg-white border border-ink-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-ink leading-tight">
                      {data.lead.priority === 'HOT' && '🔥 '}
                      {data.lead.name}
                    </h3>
                    <p className="text-[13.5px] text-ink-muted mt-0.5">
                      {data.lead.phone ?? 'No phone recorded'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <Badge color={statusColor(data.lead.status)}>
                    {data.lead.status}
                  </Badge>
                  <Badge color={data.lead.priority === 'HOT' ? 'hot' : 'default'}>
                    {data.lead.priority === 'HOT'
                      ? '🔥 HOT'
                      : data.lead.priority}
                  </Badge>
                  {data.lead.source && (
                    <Badge color="default">{data.lead.source}</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={callLead}
                    disabled={!data.lead.phone}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md
                               border border-ink-border bg-white text-ink text-[13px] font-medium
                               hover:border-brand hover:text-brand
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <button
                    onClick={waLead}
                    disabled={!data.lead.phone}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md
                               border border-ink-border bg-white text-wa text-[13px] font-medium
                               hover:border-brand
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => setFollowupOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md
                               bg-brand text-white text-[13px] font-medium hover:bg-brand-hover
                               transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Schedule follow-up
                  </button>
                </div>
              </div>

              {/* Tab content */}
              {tab === 'overview' && <OverviewTab data={data} />}
              {tab === 'activity' && <ActivityTab data={data} />}
              {tab === 'followups' && <FollowupsTab data={data} />}
              {tab === 'timeline' && <TimelineTab data={data} />}
              {tab === 'tasks' && <ComingSoonTab label="Tasks" hint="Assign tasks to this lead from the Tasks module." />}
              {tab === 'appointments' && <ComingSoonTab label="Appointments" hint="Book an appointment from the Appointments module." />}
              {tab === 'audit' && <AuditTab data={data} />}
            </>
          )}
        </div>
      </aside>

      <FollowUpModal
        lead={followupOpen && data ? { id: data.lead.id, name: data.lead.name } : null}
        onClose={() => setFollowupOpen(false)}
        onSuccess={handleFollowupSuccess}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Tab: Overview
// ─────────────────────────────────────────────
function OverviewTab({ data }: { data: LeadFactsResponse }) {
  const { lead, facts } = data;
  const overdue = lead.nextFollowupAt && daysUntil(lead.nextFollowupAt) < 0;

  return (
    <>
      {/* Current status */}
      <div className="bg-white border border-ink-border rounded-xl p-5">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted mb-2">
          Current status
        </div>
        <div className="text-[16px] font-semibold text-ink mb-3">
          {lead.nextFollowupAt ? (
            overdue ? (
              <span className="text-danger">
                🔴 Follow-up overdue by{' '}
                {Math.abs(daysUntil(lead.nextFollowupAt))} day
                {Math.abs(daysUntil(lead.nextFollowupAt)) > 1 ? 's' : ''}
              </span>
            ) : daysUntil(lead.nextFollowupAt) === 0 ? (
              <span className="text-emerald-600">🟢 Follow-up due today</span>
            ) : (
              <span className="text-brand">
                🔵 Next follow-up on {fmtDate(lead.nextFollowupAt)}
              </span>
            )
          ) : (
            <span className="text-ink-muted">⚠ No follow-up scheduled</span>
          )}
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-3 text-[13.5px]">
          <span className="text-ink-muted">Last interaction</span>
          <span className="text-ink">
            {facts.lastContactAt ? fmtDate(facts.lastContactAt) : '—'}
          </span>
          <span className="text-ink-muted">Last result</span>
          <span className="text-ink">{facts.lastResult || '—'}</span>
          <span className="text-ink-muted">Next follow-up</span>
          <span className="text-ink">
            {lead.nextFollowupAt ? fmtDate(lead.nextFollowupAt) : '—'}
          </span>
          <span className="text-ink-muted">Calls recorded</span>
          <span className="text-ink">{facts.callsCount}</span>
          <span className="text-ink-muted">WhatsApp recorded</span>
          <span className="text-ink">{facts.whatsappCount}</span>
        </div>
      </div>

      {/* Next action */}
      <div className="bg-gradient-to-br from-brand-light to-white border border-brand-lightBorder rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-brand mb-1">
              Next action (recommended)
            </div>
            <div className="text-[16px] font-semibold text-ink">
              {facts.recommendation.action}
            </div>
            <div className="text-[13px] text-ink-muted mt-0.5">
              {facts.recommendation.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Client overview */}
      <div className="bg-white border border-ink-border rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-ink mb-3">Client overview</h3>
        <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-3 text-[13.5px]">
          <span className="text-ink-muted">Name</span>
          <span className="text-ink">{lead.name}</span>
          <span className="text-ink-muted">Phone</span>
          <span className="text-ink">{lead.phone ?? '—'}</span>
          <span className="text-ink-muted">Email</span>
          <span className="text-ink">
            {lead.email ?? <em className="text-ink-muted">Not available</em>}
          </span>
          <span className="text-ink-muted">Company</span>
          <span className="text-ink">
            {lead.company ?? <em className="text-ink-muted">Not available</em>}
          </span>
          <span className="text-ink-muted">Lead ID</span>
          <span className="text-ink font-mono text-[12px]">#{lead.id.slice(-8)}</span>
          <span className="text-ink-muted">Source</span>
          <span className="text-ink">{lead.source ?? '—'}</span>
          <span className="text-ink-muted">Assigned to</span>
          <span className="text-ink">{lead.assignedTo?.name ?? 'Unassigned'}</span>
          <span className="text-ink-muted">Created</span>
          <span className="text-ink">{fmtDate(lead.createdAt)}</span>
          <span className="text-ink-muted">Value</span>
          <span className="text-ink">
            {lead.value ? `₹${lead.value.toLocaleString('en-IN')}` : '—'}
          </span>
        </div>
        {lead.notes && (
          <>
            <h4 className="text-[13px] font-semibold text-ink mt-4 mb-1.5">Notes</h4>
            <p className="text-[13.5px] text-ink whitespace-pre-wrap">
              {lead.notes}
            </p>
          </>
        )}
        {facts.missing.length > 0 && (
          <p className="text-[12.5px] text-ink-muted mt-3">
            <strong>Not recorded:</strong> {facts.missing.join(', ')}
          </p>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Tab: Activity
// ─────────────────────────────────────────────
function ActivityTab({ data }: { data: LeadFactsResponse }) {
  const acts = data.activities.filter((a) => a.type !== 'Lead created');
  if (acts.length === 0) {
    return (
      <div className="bg-white border border-ink-border rounded-xl p-10 text-center">
        <p className="text-[13.5px] text-ink-muted">No activity yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-ink-border rounded-xl p-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">
        Activity ({acts.length})
      </h3>
      <div className="space-y-3">
        {acts.map((a: any) => (
          <div key={a.id} className="border-l-2 border-brand-lightBorder pl-3 py-1">
            <div className="text-[11px] text-ink-muted uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
              <span>{fmtDate(a.createdAt)} · {a.type}</span>
              {a.by?.name && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                  by {a.by.name}
                </span>
              )}
            </div>
            <div className="text-[13.5px] font-medium text-ink mt-0.5">
              {a.title}
            </div>
            {a.body && (
              <div className="text-[12.5px] text-ink-muted mt-0.5 whitespace-pre-wrap">
                {a.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Follow-ups
// ─────────────────────────────────────────────
function FollowupsTab({ data }: { data: LeadFactsResponse }) {
  const fus = data.followups;
  if (fus.length === 0) {
    return (
      <div className="bg-white border border-ink-border rounded-xl p-10 text-center">
        <p className="text-[13.5px] text-ink-muted">No follow-ups yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-ink-border rounded-xl p-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">
        Follow-up history ({fus.length})
      </h3>
      <div className="space-y-2">
        {fus.map((f) => (
          <div key={f.id} className="border-l-2 border-brand-lightBorder pl-3 py-1.5">
            <div className="text-[13px] font-medium text-ink">{f.title}</div>
            <div className="text-[12px] text-ink-muted mt-0.5">
              {fmtDate(f.dueAt)} · {f.status}
              {f.result && ` · ${f.result}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Timeline (all activities)
// ─────────────────────────────────────────────
function TimelineTab({ data }: { data: LeadFactsResponse }) {
  const acts = data.activities;
  if (acts.length === 0) {
    return (
      <div className="bg-white border border-ink-border rounded-xl p-10 text-center">
        <p className="text-[13.5px] text-ink-muted">No timeline entries.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-ink-border rounded-xl p-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">
        Full timeline ({acts.length})
      </h3>
      <div className="space-y-3">
        {acts.map((a: any) => (
          <div key={a.id} className="border-l-2 border-brand-lightBorder pl-3 py-1">
            <div className="text-[11px] text-ink-muted uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
              <span>{fmtDate(a.createdAt)} · {a.type}</span>
              {a.by?.name && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                  by {a.by.name}
                </span>
              )}
            </div>
            <div className="text-[13.5px] font-medium text-ink mt-0.5">
              {a.title}
            </div>
            {a.body && (
              <div className="text-[12.5px] text-ink-muted mt-0.5 whitespace-pre-wrap">
                {a.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Audit (field changes)
// ─────────────────────────────────────────────
function AuditTab({ data }: { data: LeadFactsResponse }) {
  return (
    <div className="bg-white border border-ink-border rounded-xl p-10 text-center">
      <Shield className="w-8 h-8 text-ink-muted mx-auto mb-2" />
      <p className="text-[13.5px] text-ink-muted">
        Field change history will appear here when enabled.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Generic "coming soon" tab
// ─────────────────────────────────────────────
function ComingSoonTab({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="bg-white border border-ink-border rounded-xl p-10 text-center">
      <p className="text-[14px] font-semibold text-ink mb-1">{label}</p>
      <p className="text-[13px] text-ink-muted">{hint}</p>
    </div>
  );
}