import { Users, Target, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';

const FUNNEL = [
  { stage: 'New',         count: 410 },
  { stage: 'Assigned',    count: 360 },
  { stage: 'Contacted',   count: 330 },
  { stage: 'Follow-up',   count: 290 },
  { stage: 'Hot',         count: 150 },
  { stage: 'Negotiation', count: 89  },
  { stage: 'Completed',   count: 48  },
];

const SOURCES = [
  { name: 'Instagram', leads: 1180, won: 22 },
  { name: 'Facebook',  leads: 920,  won: 12 },
  { name: 'Referral',  leads: 410,  won: 9  },
  { name: 'WhatsApp',  leads: 380,  won: 3  },
  { name: 'Walk-in',   leads: 260,  won: 2  },
  { name: 'Website',   leads: 219,  won: 0  },
];

const LOST_REASONS = [
  { reason: 'Not interested',    count: 360 },
  { reason: 'Price too high',    count: 290 },
  { reason: 'No response',       count: 240 },
  { reason: 'Competitor',        count: 120 },
  { reason: 'Wrong requirement', count: 90  },
  { reason: 'Cancelled',         count: 60  },
];

export default function CEODashboard() {
  const { user } = useAuth();
  const maxFunnel = Math.max(...FUNNEL.map((f) => f.count));
  const maxLost = Math.max(...LOST_REASONS.map((l) => l.count));
  const topSource = SOURCES.reduce((a, b) => (b.leads > a.leads ? b : a));
  const bestSource = SOURCES.reduce((a, b) => (b.won / b.leads > a.won / a.leads ? b : a));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Company Dashboard</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">{user?.name} · Business overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Total leads</span>
            <Users className="w-4 h-4 text-brand" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">3,369</div>
          <div className="text-[12px] text-ink-muted mt-0.5">All time</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Active</span>
            <Target className="w-4 h-4 text-brand" />
          </div>
          <div className="text-[26px] font-bold text-brand leading-tight">1,629</div>
          <div className="text-[12px] text-ink-muted mt-0.5">In pipeline</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Completed</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-[26px] font-bold text-success leading-tight">48</div>
          <div className="text-[12px] text-ink-muted mt-0.5">1.4% conversion</div>
        </div>
        <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Revenue</span>
            <DollarSign className="w-4 h-4 text-success" />
          </div>
          <div className="text-[26px] font-bold text-ink leading-tight">₹5.9L</div>
          <div className="text-[12px] text-ink-muted mt-0.5">₹2.7L pending</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-brand-light to-white border border-brand-lightBorder rounded-xl p-5">
        <h2 className="text-[15px] font-semibold text-ink mb-2">Executive summary</h2>
        <p className="text-[13.5px] text-ink leading-relaxed">
          <strong>{topSource.name}</strong> brings the most leads ({topSource.leads.toLocaleString('en-IN')}).{' '}
          <strong>{bestSource.name}</strong> converts best at {((bestSource.won / bestSource.leads) * 100).toFixed(1)}%.{' '}
          Top lost reason: <strong>{LOST_REASONS[0].reason}</strong> ({Math.round((LOST_REASONS[0].count / 1210) * 100)}% of lost leads).
        </p>
      </div>

      <div className="bg-white border border-ink-border rounded-xl p-5 shadow-sm">
        <h2 className="text-[15px] font-semibold text-ink mb-4">Sales funnel</h2>
        <div className="space-y-3">
          {FUNNEL.map((f) => (
            <div key={f.stage} className="flex items-center gap-3">
              <span className="w-[110px] text-[13px] text-ink-muted shrink-0">{f.stage}</span>
              <div className="flex-1 h-5 bg-ink-bg rounded-md overflow-hidden">
                <div className="h-full bg-brand rounded-md transition-all" style={{ width: `${(f.count / maxFunnel) * 100}%` }} />
              </div>
              <span className="w-[50px] text-right text-[13px] font-medium text-ink">{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-ink-border rounded-xl p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-ink mb-4">Lead sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  {['SOURCE', 'LEADS', 'WON', 'RATE'].map((h) => (
                    <th key={h} className="text-left text-ink-muted text-[11px] uppercase font-semibold px-2 py-2 border-b border-ink-border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.name} className="border-b border-ink-border last:border-0">
                    <td className="px-2 py-2.5 text-ink font-medium">{s.name}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{s.leads.toLocaleString('en-IN')}</td>
                    <td className="px-2 py-2.5 text-success font-medium">{s.won}</td>
                    <td className="px-2 py-2.5 text-ink">{((s.won / s.leads) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-ink-border rounded-xl p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-ink mb-4">Lost reasons</h2>
          <div className="space-y-3">
            {LOST_REASONS.map((l) => (
              <div key={l.reason} className="flex items-center gap-3">
                <span className="w-[140px] text-[13px] text-ink-muted shrink-0 truncate">{l.reason}</span>
                <div className="flex-1 h-4 bg-ink-bg rounded-md overflow-hidden">
                  <div className="h-full bg-danger rounded-md transition-all" style={{ width: `${(l.count / maxLost) * 100}%` }} />
                </div>
                <span className="w-[40px] text-right text-[13px] text-ink">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
