import { Users, Flame, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';

const TEAM = [
  { name: 'Rashin',     active: 41, due: 9,  done: 6, od: 3, hot: 2 },
  { name: 'Raziq Sanu', active: 12, due: 6,  done: 5, od: 0, hot: 1 },
  { name: 'Aysha',      active: 68, due: 11, done: 4, od: 7, hot: 4 },
  { name: 'Muhammed',   active: 27, due: 8,  done: 7, od: 1, hot: 3 },
];

export default function BDMDashboard() {
  const { user } = useAuth();
  const sum = (k: keyof typeof TEAM[0]) =>
    TEAM.reduce((a, r) => a + (r[k] as number), 0);

  const maxActive = Math.max(...TEAM.map((r) => r.active));
  const minActive = Math.min(...TEAM.map((r) => r.active));
  const hasImbalance = maxActive >= minActive * 2.5;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Team Dashboard</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">
          {user?.name} · {TEAM.length} team members
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Active leads</span>
            <Users className="w-4 h-4 text-brand" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">{sum('active')}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Team-wide</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Due today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">{sum('due')}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Follow-ups</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Overdue</span>
            <AlertCircle className="w-4 h-4 text-danger" />
          </div>
          <div className="text-[26px] font-bold text-danger leading-tight">{sum('od')}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Backlog</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Completed today</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-[26px] font-bold text-success leading-tight">{sum('done')}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">Missions</div>
        </div>
      </div>

      {hasImbalance && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-amber-900">Workload imbalance detected</div>
            <p className="text-[13px] text-amber-800 mt-0.5">
              {TEAM.reduce((a, b) => (b.active > a.active ? b : a)).name} has {maxActive} active leads vs{' '}
              {TEAM.reduce((a, b) => (b.active < a.active ? b : a)).name} with {minActive}. Consider reassigning some leads.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-border">
          <h2 className="text-base font-semibold text-ink">Team overview</h2>
          <p className="text-[13px] text-ink-muted">Performance at a glance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] min-w-[640px]">
            <thead>
              <tr>
                {['BDE', 'ACTIVE', 'DUE', 'DONE', 'OVERDUE', 'HOT', 'COMPLETION'].map((h) => (
                  <th key={h} className="text-left text-brand text-[12px] font-semibold px-4 py-3 border-b border-ink-border whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM.map((r) => {
                const completion = r.due + r.done ? Math.round((r.done / (r.done + r.due)) * 100) : 0;
                return (
                  <tr key={r.name} className="border-b border-ink-border last:border-0 hover:bg-brand-light transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-light text-brand flex items-center justify-center text-[11px] font-bold">
                          {r.name.charAt(0)}
                        </div>
                        <span className="font-medium text-ink">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{r.active}</td>
                    <td className="px-4 py-3 text-ink">{r.due}</td>
                    <td className="px-4 py-3 text-success font-medium">{r.done}</td>
                    <td className="px-4 py-3">
                      {r.od > 0 ? <span className="text-danger font-medium">🔴 {r.od}</span> : <span className="text-ink-muted">0</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.hot > 0 ? <span className="text-orange-500 font-medium">{r.hot}</span> : <span className="text-ink-muted">0</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-ink-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${completion}%` }} />
                        </div>
                        <span className="text-[13px] text-ink-muted">{completion}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
