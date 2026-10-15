import { useEffect, useState } from 'react';
import { Clock, LogIn, LogOut, Users, Wifi, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/shared/api/client';

interface Session { login: string; logout: string | null; }
interface Row {
  userId: string; name: string; email: string; role: string;
  date: string; firstLogin: string | null; lastLogout: string | null;
  loginCount: number; hours: number | null; isOnline: boolean; sessions: Session[];
}
interface Summary { totalStaff: number; onlineNow: number; totalHours: number; avgHours: number; }
type Range = 'today' | 'week' | 'month';

function rangeToDates(r: Range) {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date();
  if (r === 'today') from.setHours(0, 0, 0, 0);
  if (r === 'week') from.setDate(now.getDate() - 7);
  if (r === 'month') from.setDate(now.getDate() - 30);
  return { from: from.toISOString(), to };
}
function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtHours(h: number | null): string {
  if (h == null) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}
function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent: string }) {
  return (
    <div className="bg-white border border-ink-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className="text-[24px] font-bold text-ink leading-tight">{value}</div>
    </div>
  );
}

export default function AttendancePage() {
  const [range, setRange] = useState<Range>('today');
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setError('');
    const { from, to } = rangeToDates(range);
    api
      .get<{ data: Row[]; summary: Summary }>('/audit/attendance', { params: { from, to } })
      .then((r) => { setRows(r.data.data); setSummary(r.data.summary); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Could not load.'))
      .finally(() => setLoading(false));
  }, [range]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Attendance</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">Login / logout times and working hours per staff</p>
      </div>

      <div className="flex gap-2">
        {(['today', 'week', 'month'] as Range[]).map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              range === r ? 'bg-ink text-white' : 'bg-white border border-ink-border text-ink hover:bg-ink-bg'
            }`}>
            {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 days' : 'Last 30 days'}
          </button>
        ))}
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Staff present" value={summary.totalStaff} icon={Users} accent="text-brand" />
          <KpiCard label="Online now" value={summary.onlineNow} icon={Wifi} accent="text-emerald-600" />
          <KpiCard label="Total hours" value={fmtHours(summary.totalHours)} icon={Clock} accent="text-amber-600" />
          <KpiCard label="Avg / person" value={fmtHours(summary.avgHours)} icon={TrendingUp} accent="text-purple-600" />
        </div>
      )}

      <div className="bg-white border border-ink-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" />
          <h2 className="text-base font-semibold text-ink">{rows.length} record{rows.length === 1 ? '' : 's'}</h2>
        </div>

        {loading && <div className="p-8 text-center text-ink-muted text-sm">Loading…</div>}
        {error && <div className="p-8 text-center text-danger text-sm">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="p-8 text-center text-ink-muted text-sm">No attendance records for this period.</div>
        )}

        {!loading && rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-ink-bg">
              <tr className="text-left text-[12px] uppercase tracking-wider text-brand font-semibold">
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">First login</th>
                <th className="px-4 py-3">Last logout</th>
                <th className="px-4 py-3 text-center">Sessions</th>
                <th className="px-4 py-3 text-right">Total hours</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const key = `${r.userId}-${r.date}`;
                const open = expanded[key];
                return (
                  <>
                    <tr key={key} onClick={() => toggle(key)}
                      className="border-t border-ink-border cursor-pointer hover:bg-ink-bg/60">
                      <td className="px-4 py-3 text-ink-muted">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 font-medium text-ink">
                        <span className="inline-flex items-center gap-2">
                          {r.isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                          {r.name}
                          {r.isOnline && <span className="text-[11px] text-emerald-600 font-semibold">ONLINE</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{r.role}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">{fmtTime(r.firstLogin)}</td>
                      <td className="px-4 py-3 text-amber-700 font-medium">{fmtTime(r.lastLogout)}</td>
                      <td className="px-4 py-3 text-center text-ink">{r.loginCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{fmtHours(r.hours)}</td>
                    </tr>
                    {open && (
                      <tr key={`${key}-detail`} className="bg-ink-bg/40">
                        <td></td>
                        <td colSpan={7} className="px-4 py-3">
                          <div className="rounded-md border border-ink-border bg-white overflow-hidden">
                            <table className="w-full text-[13px]">
                              <thead className="bg-ink-bg">
                                <tr className="text-left text-[11px] uppercase tracking-wider text-brand font-semibold">
                                  <th className="px-3 py-2 w-12">#</th>
                                  <th className="px-3 py-2"><span className="inline-flex items-center gap-1"><LogIn className="w-3 h-3" /> Login</span></th>
                                  <th className="px-3 py-2"><span className="inline-flex items-center gap-1"><LogOut className="w-3 h-3" /> Logout</span></th>
                                  <th className="px-3 py-2 text-right">Duration</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.sessions.map((s, i) => {
                                  const durationMs = s.login && s.logout ? new Date(s.logout).getTime() - new Date(s.login).getTime() : null;
                                  const durationH = durationMs ? durationMs / 3600000 : null;
                                  return (
                                    <tr key={i} className="border-t border-ink-border">
                                      <td className="px-3 py-1.5 text-ink-muted">{i + 1}</td>
                                      <td className="px-3 py-1.5 text-emerald-700">{fmtTime(s.login)}</td>
                                      <td className="px-3 py-1.5 text-amber-700">
                                        {s.logout ? fmtTime(s.logout) : <span className="text-emerald-600 font-semibold">still online</span>}
                                      </td>
                                      <td className="px-3 py-1.5 text-right text-ink-muted">{fmtHours(durationH)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
