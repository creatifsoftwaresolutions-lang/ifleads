import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Plus, CheckSquare, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/app/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface Props {
  onOpenMenu: () => void;
}

const ITEMS = [
  { label: 'Home',  href: '/dashboard', icon: Home },
  { label: 'Leads', href: '/leads',     icon: Users },
  // middle "Add" is a button, not a link
  { label: 'Tasks', href: '/tasks',     icon: CheckSquare },
] as const;

export function MobileBottomNav({ onOpenMenu }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { can } = useAuth();
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? location.pathname === '/' || location.pathname.startsWith('/dashboard')
      : location.pathname.startsWith(href);

  const quickLinks = [
    can('leads:create') && { label: 'New Lead',        emoji: '👤', href: '/leads' },
    can('tasks:create') && { label: 'New Task',        emoji: '✓',  href: '/tasks' },
    can('appointments:create') && { label: 'New Appointment', emoji: '📅', href: '/appointments' },
    can('customers:create') && { label: 'New Customer', emoji: '🏢', href: '/customers' },
  ].filter(Boolean) as { label: string; emoji: string; href: string }[];

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink-border lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.href);
            return (
              <NavLink
                key={it.href}
                to={it.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium',
                  active ? 'text-brand' : 'text-ink-muted',
                )}
              >
                <Icon className="w-5 h-5" />
                {it.label}
              </NavLink>
            );
          })}

          {/* Add button */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex flex-col items-center justify-center"
          >
            <span className="w-11 h-11 -mt-4 rounded-full bg-brand text-white flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5" />
            </span>
            <span className="text-[10.5px] font-medium text-ink-muted mt-0.5">Add</span>
          </button>

          {/* More (opens drawer) */}
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium text-ink-muted"
          >
            <Menu className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>

      {/* Add sheet */}
      {addOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={() => setAddOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 z-[60] bg-white rounded-t-2xl shadow-2xl p-5 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-ink">Quick add</h3>
              <button
                onClick={() => setAddOpen(false)}
                className="w-8 h-8 rounded-md text-ink-muted hover:bg-brand-light"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((q) => (
                <button
                  key={q.href}
                  onClick={() => {
                    setAddOpen(false);
                    navigate(q.href);
                  }}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl border border-ink-border bg-white hover:border-brand hover:bg-brand-light transition-colors text-left"
                >
                  <span className="text-2xl">{q.emoji}</span>
                  <span className="text-[13.5px] font-medium text-ink">{q.label}</span>
                </button>
              ))}
              {quickLinks.length === 0 && (
                <p className="col-span-2 text-center text-[13px] text-ink-muted py-4">
                  You don't have permission to create anything.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
