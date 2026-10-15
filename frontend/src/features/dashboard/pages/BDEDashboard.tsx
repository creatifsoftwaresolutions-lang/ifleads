import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/auth-provider';
import { missionsService } from '@/features/missions/pages/missions.service';
import { Target, Flame, Sparkles, TrendingUp } from 'lucide-react';

export default function BDEDashboard() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['missions-today'],
    queryFn: missionsService.today,
  });
  const stats = data?.stats;
  const counts = data?.counts;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Good day, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </p>
      </div>

      <div className="bg-gradient-to-br from-brand to-brand-hover text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-[13px] uppercase tracking-wider font-semibold opacity-90">
              Level {stats?.level ?? 1} · {stats?.levelName ?? 'New Starter'}
            </span>
          </div>
          <div className="text-[13px] font-bold">{stats?.xp ?? 0} XP</div>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${stats?.levelPct ?? 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12.5px] opacity-90">
          <span>{stats?.streak ?? 0} day{(stats?.streak ?? 0) === 1 ? '' : 's'} streak 🔥</span>
          <span>Daily goal: {counts?.today ?? 0} / {stats?.dailyGoal ?? 8}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Overdue</span>
            <Flame className="w-4 h-4 text-danger" />
          </div>
          <div className="text-[26px] font-bold text-danger leading-tight">{counts?.overdue ?? 0}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Needs action</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Due today</span>
            <Target className="w-4 h-4 text-brand" />
          </div>
          <div className="text-[26px] font-bold text-brand leading-tight">{counts?.today ?? 0}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Follow-ups</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Hot leads</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-[26px] font-bold text-orange-500 leading-tight">{counts?.hot ?? 0}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">High priority</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Total</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">
            {(counts?.overdue ?? 0) + (counts?.today ?? 0) + (counts?.hot ?? 0)}
          </div>
          <div className="text-[12px] text-ink-muted mt-0.5">In your queue</div>
        </div>
      </div>

      <div className="bg-white border border-ink-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Today's missions</h2>
            <p className="text-[13px] text-ink-muted">Your priority follow-ups</p>
          </div>
          <a href="/missions" className="text-[13px] font-medium text-brand hover:underline">
            View all →
          </a>
        </div>
        {data?.missions && data.missions.length > 0 ? (
          <div className="space-y-2">
            {data.missions.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-ink-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-bold shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate">
                    {m.priority === 'HOT' && '🔥 '}{m.name}
                  </div>
                  <div className="text-[12px] text-ink-muted truncate">{m.nextAction}</div>
                </div>
                {m.kind === 'overdue' && (
                  <span className="text-[11px] font-semibold uppercase text-danger tracking-wide shrink-0">
                    Overdue
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl mb-1">🎉</div>
            <p className="text-[13.5px] text-ink-muted">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
