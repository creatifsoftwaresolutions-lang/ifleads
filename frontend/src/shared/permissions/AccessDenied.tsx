import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  module?: string;
  message?: string;
}

/**
 * Shows when the user opened a page but lacks permission to view data.
 * Backend already returned 403 — this is just the friendly UI.
 */
export function AccessDenied({ module, message }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-brand"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border border-ink-border rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-ink mb-2">
          Access Restricted
        </h2>
        <p className="text-[14px] text-ink-muted max-w-md mx-auto leading-relaxed">
          {message ??
            `You don't have permission to view ${
              module ? `the ${module} module` : 'this content'
            }. Contact your administrator if you need access.`}
        </p>
      </div>
    </div>
  );
}
