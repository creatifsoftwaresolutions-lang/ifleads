import { useEffect, useState } from 'react';
import { X, Send, User, Phone, Search, AlertCircle } from 'lucide-react';
import { whatsappService, Template } from '../services/whatsapp.service';
import { leadsService } from '@/features/leads/services/leads.service';
import { cn } from '@/shared/utils/cn';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  company: string | null;
}

interface Props {
  open: boolean;
  template: Template | null;
  onClose: () => void;
  onSent?: () => void;
}

export function SendTemplateModal({ open, template, onClose, onSent }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(null);
    setSearch('');
    setManualPhone('');
    setManualName('');
    leadsService
      .list({ page: 1, pageSize: 200 })
      .then((r: any) => setLeads(r.data ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (template) setMessage(template.body);
  }, [template]);

  useEffect(() => {
    if (!template) return;
    const name = selected?.name || manualName || '{name}';
    const company = selected?.company || '{company}';
    const phone = selected?.phone || manualPhone || '{phone}';
    setMessage(
      template.body
        .replace(/\{name\}/gi, name)
        .replace(/\{company\}/gi, company)
        .replace(/\{phone\}/gi, phone),
    );
  }, [selected, manualName, manualPhone, template]);

  if (!open || !template) return null;

  const phone = (selected?.phone || manualPhone || '').replace(/\D/g, '');
  const canSend = phone.length >= 8 && message.trim().length > 0;

  const filteredLeads = search
    ? leads.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.phone ?? '').includes(search) ||
        (l.company ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : leads;

  const doSend = async () => {
    if (!canSend) return;
    setError('');
    setSending(true);
    try {
      const res = await whatsappService.send({
        phone: selected?.phone || manualPhone,
        message: message.trim(),
        leadId: selected?.id,
        templateId: template.id,
      });
      window.open(res.waLink, '_blank', 'noopener');
      onSent?.();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to open WhatsApp');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-[900px] w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-border">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Send Template</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">Pick a lead, customize, then open WhatsApp</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md text-ink-muted hover:bg-brand-light">
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-0">
          <div className="p-5 border-r border-ink-border space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              <span className="text-[13px] font-semibold text-ink">Pick a lead</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, company…"
                className="w-full h-9 pl-8 pr-3 border border-ink-border rounded-md text-[13px] bg-white focus:outline-none focus:border-brand" />
            </div>
            {loading && <div className="text-center py-6 text-[12.5px] text-ink-muted">Loading leads…</div>}
            {!loading && filteredLeads.length === 0 && (
              <div className="text-center py-6 text-[12.5px] text-ink-muted">No leads found. Use manual entry below.</div>
            )}
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
              {filteredLeads.slice(0, 100).map((l) => (
                <button key={l.id} onClick={() => setSelected(l)}
                  className={cn('w-full text-left px-3 py-2 rounded-md border transition-colors',
                    selected?.id === l.id ? 'border-brand bg-brand-light/50 ring-1 ring-brand' : 'border-ink-border hover:border-brand/40 hover:bg-ink-bg')}>
                  <div className="text-[13px] font-medium text-ink">{l.name}</div>
                  <div className="text-[11.5px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {l.phone ?? 'no phone'}
                    {l.company && <span>· {l.company}</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-ink-border space-y-2">
              <div className="text-[11.5px] uppercase tracking-wider text-ink-muted font-semibold">Or enter manually</div>
              <input value={manualName} onChange={(e) => { setManualName(e.target.value); setSelected(null); }} placeholder="Name"
                className="w-full h-9 px-3 border border-ink-border rounded-md text-[13px] focus:outline-none focus:border-brand" />
              <input value={manualPhone} onChange={(e) => { setManualPhone(e.target.value); setSelected(null); }} placeholder="Phone (with country code)"
                className="w-full h-9 px-3 border border-ink-border rounded-md text-[13px] focus:outline-none focus:border-brand" />
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">Message preview</span>
              <button onClick={() => navigator.clipboard.writeText(message)} className="text-[12px] text-brand hover:underline">Copy text</button>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={10}
              className="w-full px-3 py-2 border border-ink-border rounded-md text-[13.5px] resize-none focus:outline-none focus:border-brand" />
            <div className="bg-ink-bg rounded-md p-3 text-[12.5px]">
              <div className="text-ink-muted">Will open WhatsApp for:</div>
              <div className="text-ink font-medium mt-0.5">
                {selected?.name || manualName || '(pick a lead)'}{' '}
                {phone && <span className="text-ink-muted">· {phone}</span>}
              </div>
            </div>
            {!canSend && (
              <div className="flex items-start gap-2 text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>Pick a lead (or enter a phone) with a valid number first.</div>
              </div>
            )}
            {error && <div className="text-[13px] text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 px-5 py-3.5 border-t border-ink-border">
          <div className="text-[11.5px] text-ink-muted">Opens wa.me in a new tab — you send from your own WhatsApp Web</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 px-4 rounded-md border border-ink-border text-[13.5px] hover:bg-brand-light">Cancel</button>
            <button onClick={doSend} disabled={!canSend || sending}
              className="h-10 px-5 rounded-md bg-emerald-600 text-white text-[13.5px] font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
              <Send className="w-4 h-4" />
              {sending ? 'Opening…' : 'Open WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
