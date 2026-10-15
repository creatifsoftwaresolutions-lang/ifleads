import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface Props {
  lead: { id: string; name: string; phone: string | null } | null;
  onClose: () => void;
}

const TEMPLATES = [
  {
    label: 'Follow-up',
    text: (name: string) =>
      `Hi ${name},\n\nI'm following up regarding your enquiry.\n\nPlease let me know a convenient time to discuss.\n\nRegards,\nTeam`,
  },
  {
    label: 'Quotation',
    text: (name: string) =>
      `Hi ${name},\n\nAs discussed, I've prepared your quotation. Please review and let me know if you have any questions.\n\nRegards,\nTeam`,
  },
  {
    label: 'Meeting',
    text: (name: string) =>
      `Hi ${name},\n\nWould you be available for a quick meeting this week? Let me know your preferred time.\n\nRegards,\nTeam`,
  },
  {
    label: 'Reminder',
    text: (name: string) =>
      `Hi ${name},\n\nJust a friendly reminder about our discussion. Let me know how you'd like to proceed.\n\nRegards,\nTeam`,
  },
];

export function WhatsAppModal({ lead, onClose }: Props) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (lead) {
      setMessage(TEMPLATES[0].text(lead.name));
    }
  }, [lead]);

  if (!lead) return null;

  const waNumber = (lead.phone ?? '').replace(/\D/g, '');
  const canSend = waNumber.length >= 8 && message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-wa" />
            <div>
              <h2 className="text-[16px] font-semibold text-ink leading-tight">
                WhatsApp {lead.name}
              </h2>
              <p className="text-[12.5px] text-ink-muted">
                {lead.phone ?? 'No phone number'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-muted hover:bg-brand-light hover:text-brand transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Template chips */}
          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              Quick template
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setMessage(t.text(lead.name))}
                  className="px-2.5 py-1 text-[12.5px] rounded-md border border-ink-border
                             bg-white text-ink hover:border-brand hover:text-brand transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="w-full px-3 py-2 border border-ink-border rounded-md text-[13.5px]
                         bg-white focus:outline-none focus:border-brand resize-none font-sans"
            />
          </div>

          <p className="text-[12.5px] text-ink-muted leading-snug">
            Review the message, then click <strong>Open WhatsApp</strong>. Nothing is sent automatically.
          </p>

          {!canSend && (
            <div className="text-[12.5px] text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {!waNumber ? 'This lead has no phone number.' : 'Message cannot be empty.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-ink-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-ink-border text-[13.5px] text-ink
                       hover:bg-brand-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="h-10 px-5 rounded-md bg-wa text-white text-[13.5px] font-medium
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Open WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
