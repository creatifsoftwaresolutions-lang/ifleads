import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { notificationsService, Notification } from '../services/notifications.service';
import { cn } from '@/shared/utils/cn';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list({ limit: 30 }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = data?.unreadCount ?? 0;
  const items = data?.data ?? [];

  const markRead = async (n: Notification) => {
    if (n.readAt) return;
    try {
      await notificationsService.markRead(n.id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 grid place-items-center rounded-md hover:bg-brand-light transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-ink" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center border-2 border-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[380px] bg-white border border-ink-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
            <div>
              <h3 className="text-[14px] font-semibold text-ink">Notifications</h3>
              {unread > 0 && (
                <p className="text-[11.5px] text-ink-muted mt-0.5">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[12px] text-brand font-medium hover:underline inline-flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 && (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto text-ink-muted mb-2 opacity-40" />
                <p className="text-[13px] text-ink-muted">You're all caught up</p>
              </div>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n)}
                className={cn(
                  'px-4 py-3 border-b border-ink-border last:border-0 cursor-pointer hover:bg-brand-light/40 transition-colors',
                  !n.readAt && 'bg-brand-light/20'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-light text-brand grid place-items-center shrink-0 text-[10px] font-bold uppercase">
                    {n.type.split('.')[0].slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-medium text-ink leading-tight">
                        {n.title}
                      </div>
                      {!n.readAt && (
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <div className="text-[11px] text-ink-muted mt-1">
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
