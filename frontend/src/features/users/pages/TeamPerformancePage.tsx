import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Users } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import {
  usersService,
  type AppUser,
  ROLE_LABEL,
  ROLE_COLOR,
} from '@/features/users/services/users.service';

type RoleTab = 'SALES_HEAD' | 'BDM' | 'BDE';

const TABS_BY_ROLE: Record<string, RoleTab[]> = {
  ADMIN:      ['SALES_HEAD', 'BDM', 'BDE'],
  CEO:        ['SALES_HEAD', 'BDM', 'BDE'],
  BDM:        ['SALES_HEAD', 'BDE'],
  SALES_HEAD: ['BDE'],
  BDE:        [],
};

export default function TeamPerformancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tabs = TABS_BY_ROLE[user?.role ?? ''] ?? [];
  const [active, setActive] = useState<RoleTab | undefined>(tabs[0]);
  const [rows, setRows] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError('');
    usersService
      .list({ role: active, page: 1, pageSize: 100 })
      .then((r) => setRows(r.data))
      .catch((e) =>
        setError(e?.response?.data?.message ?? 'Failed to load team')
      )
      .finally(() => setLoading(false));
  }, [active]);

  if (!user) return null;

  if (tabs.length === 0) {
    return (
      <div className="bg-white border border-ink-border rounded-xl p-10 text-center shadow-sm">
        <p className="text-ink-muted">You don't have a team to view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Team Performance</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">
          View panels for your team members
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              active === t
                ? 'bg-ink text-white'
                : 'bg-white border border-ink-border text-ink hover:bg-ink-bg'
            }`}
          >
            {ROLE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-border flex items-center gap-2">
          <Users className="w-4 h-4 text-brand" />
          <h2 className="text-base font-semibold text-ink">
            {ROLE_LABEL[active!]} details
          </h2>
        </div>

        {loading && (
          <div className="p-8 text-center text-ink-muted text-sm">Loading…</div>
        )}
        {error && (
          <div className="p-8 text-center text-danger text-sm">{error}</div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="p-8 text-center text-ink-muted text-sm">
            No {ROLE_LABEL[active!]} members found in your scope.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-ink-bg">
              <tr className="text-left text-[12px] uppercase tracking-wider text-brand font-semibold">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-ink-border hover:bg-ink-bg/50"
                >
                  <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{u.email}</td>
                  <td className="px-5 py-3 text-ink-muted">{u.phone ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        ROLE_COLOR[u.role]
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/panel/${u.id}`, { state: { userName: u.name } })}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
                    >
                      View panel <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[12.5px] text-ink-muted text-center">
        A list of all {ROLE_LABEL[active!]} members in your scope.
      </p>
    </div>
  );
}
