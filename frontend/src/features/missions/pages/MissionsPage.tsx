import { useQuery } from '@tanstack/react-query';
import { Flame, Trophy, Target, TrendingUp, Crown, Medal, Award, Clock, Zap, Phone, MessageCircle, User, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { ClientProfile } from '@/features/leads/components/ClientProfile';
import { FollowUpModal } from '@/features/leads/components/FollowUpModal';
import { missionsService, XP_LABELS } from '../services/missions.service';
import { cn } from '@/shared/utils/cn';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm ago';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h ago';
  return Math.floor(hr / 24) + 'd ago';
}

const RANK_ICONS = [Crown, Medal, Award];

export default function MissionsPage() {
  const [openClient, setOpenClient] = useState<string | null>(null);
  const [followupFor, setFollowupFor] = useState<{ id: string; name: string } | null>(null);

  const callLead = (phone: string | null) => {
    if (!phone) return;
    window.location.href = `tel:+${phone.replace(/\D/g, '')}`;
  };

  const waLead = (phone: string | null, name: string) => {
    if (!phone) return;
    const num = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hi ${name},\n\nFollowing up regarding your enquiry.\n\nRegards,\nTeam`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank', 'noopener');
  };
  const todayQ = useQuery({ queryKey: ['missions', 'today'], queryFn: () => missionsService.today() });
  const boardQ = useQuery({ queryKey: ['missions', 'leaderboard'], queryFn: () => missionsService.leaderboard(), refetchInterval: 60000 });
  const historyQ = useQuery({ queryKey: ['missions', 'history'], queryFn: () => missionsService.history() });

  const stats = todayQ.data?.stats;
  const missions = todayQ.data?.missions ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Missions & XP</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">Complete actions to earn XP and climb the leaderboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Total XP</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">{stats?.xp ?? 0}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Level {stats?.level ?? 1} · {stats?.levelName ?? 'New Starter'}</div>
        </div>

        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">{stats?.streak ?? 0}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">{(stats?.streak ?? 0) > 0 ? 'days in a row' : 'start today!'}</div>
        </div>

        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Daily goal</span>
            <Target className="w-4 h-4 text-brand" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">{stats?.doneToday ?? 0}<span className="text-[15px] text-ink-muted font-normal">/{stats?.dailyGoal ?? 8}</span></div>
          <div className="text-[12px] text-ink-muted mt-0.5">follow-ups today</div>
        </div>

        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Rank</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">#{boardQ.data?.find((r) => r.isMe)?.rank ?? '—'}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">on the leaderboard</div>
        </div>
      </div>

      {stats && (
        <div className="bg-gradient-to-br from-brand-light to-white border border-brand-lightBorder rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[12px] uppercase tracking-wider font-semibold text-brand">Level {stats.level}</div>
                <div className="text-[18px] font-bold text-ink">{stats.levelName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-ink-muted">Next level</div>
              <div className="text-[16px] font-bold text-ink">{stats.levelNextXp ? stats.levelNextXp + ' XP' : 'MAX'}</div>
            </div>
          </div>
          <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-brand-hover rounded-full transition-all duration-500" style={{ width: (stats.levelPct || 0) + '%' }} />
          </div>
          <div className="flex justify-between text-[11.5px] text-ink-muted mt-1.5">
            <span>{stats.xp} XP</span>
            <span>{stats.levelPct}%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-ink-border flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" />
            <h2 className="text-[14px] font-semibold text-ink">Today's missions ({missions.length})</h2>
          </div>
          {missions.length === 0 && (
            <div className="py-16 text-center">
              <Target className="w-10 h-10 mx-auto text-ink-muted mb-3 opacity-40" />
              <p className="text-ink font-medium text-[15px] mb-1">All caught up! 🎉</p>
              <p className="text-ink-muted text-[13px]">No overdue, today, or hot leads need your attention.</p>
            </div>
          )}
          {missions.length > 0 && (
            <div className="divide-y divide-ink-border">
              {missions.map((m) => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3 hover:bg-brand-light/30 transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', m.kind === 'overdue' ? 'bg-red-500' : m.kind === 'today' ? 'bg-amber-500' : 'bg-orange-500')} />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setOpenClient(m.id)}
                      className="text-[13.5px] font-medium text-ink truncate hover:text-brand text-left transition-colors"
                    >
                      {m.name}
                    </button>
                    <div className="text-[12px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {m.nextFollowupAt ? new Date(m.nextFollowupAt).toLocaleDateString('en-GB') : 'No follow-up'}
                      <span>· {m.nextAction}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => callLead(m.phone)}
                      disabled={!m.phone}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-border bg-white text-ink-muted hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={m.phone ? `Call ${m.phone}` : 'No phone'}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => waLead(m.phone, m.name)}
                      disabled={!m.phone}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-border bg-white text-ink-muted hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={m.phone ? `WhatsApp ${m.name}` : 'No phone'}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFollowupFor({ id: m.id, name: m.name })}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-border bg-white text-ink-muted hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      title="Schedule follow-up"
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setOpenClient(m.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-border bg-white text-ink-muted hover:bg-brand-light hover:text-brand hover:border-brand transition-colors"
                      title="Open profile"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFollowupFor({ id: m.id, name: m.name })}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand text-white text-[12px] font-semibold hover:bg-brand-hover transition-colors shadow-sm ml-1"
                      title="Complete this mission"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete mission
                    </button>
                    <span className={cn('text-[10.5px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ml-1', m.kind === 'overdue' ? 'bg-red-100 text-red-700' : m.kind === 'today' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700')}>{m.kind}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-ink-border flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-500" />
              <h2 className="text-[14px] font-semibold text-ink">Team Leaderboard</h2>
            </div>
            <div>
              {(boardQ.data ?? []).slice(0, 10).map((row) => {
                const Icon = row.rank <= 3 ? RANK_ICONS[row.rank - 1] : null;
                return (
                  <div key={row.userId} className={cn('px-5 py-2.5 flex items-center gap-3 border-b border-ink-border last:border-0', row.isMe && 'bg-brand-light/40')}>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0', row.rank === 1 ? 'bg-amber-100 text-amber-700' : row.rank === 2 ? 'bg-gray-200 text-gray-700' : row.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-ink-bg text-ink-muted')}>
                      {Icon ? <Icon className="w-3.5 h-3.5" /> : row.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink truncate">{row.name}{row.isMe && <span className="text-[11px] text-brand ml-1.5">(you)</span>}</div>
                      <div className="text-[11px] text-ink-muted">{row.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-ink">{row.xp}</div>
                      <div className="text-[10.5px] text-ink-muted">XP</div>
                    </div>
                  </div>
                );
              })}
              {(boardQ.data ?? []).length === 0 && (
                <div className="py-8 text-center text-[12.5px] text-ink-muted">No XP earned yet</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-ink-border flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h2 className="text-[14px] font-semibold text-ink">Recent XP</h2>
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {(historyQ.data ?? []).length === 0 && (
                <div className="py-8 text-center text-[12.5px] text-ink-muted">Complete actions to earn XP</div>
              )}
              {(historyQ.data ?? []).map((row) => (
                <div key={row.id} className="px-5 py-2.5 flex items-center gap-3 border-b border-ink-border last:border-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">+{row.amount}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-ink truncate">{XP_LABELS[row.reason] ?? row.reason}</div>
                    <div className="text-[11px] text-ink-muted">{timeAgo(row.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ClientProfile leadId={openClient} onClose={() => setOpenClient(null)} />
      <FollowUpModal
        lead={followupFor}
        onClose={() => setFollowupFor(null)}
        onSuccess={() => {
          setFollowupFor(null);
          todayQ.refetch();
          boardQ.refetch();
          historyQ.refetch();
        }}
      />
    </div>
  );
}
