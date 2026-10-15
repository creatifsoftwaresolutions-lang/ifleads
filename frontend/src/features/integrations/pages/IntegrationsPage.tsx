import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Copy, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { integrationsService } from '../services/integrations.service';
import { AccessDenied } from '@/shared/permissions/AccessDenied';
import { cn } from '@/shared/utils/cn';

export default function IntegrationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['meta-status'],
    queryFn: integrationsService.metaStatus,
  });
  const [copied, setCopied] = useState<string | null>(null);

  // If backend returns 403, show Access Denied
  const isForbidden = (error as any)?.response?.status === 403;
  if (isForbidden) {
    return <AccessDenied module="Integrations" />;
  }

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Integrations</h1>
        <p className="text-[13.5px] text-ink-muted mt-0.5">
          Connect external services to capture leads automatically
        </p>
      </div>

      <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Facebook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Meta Lead Ads</h2>
              <p className="text-[12.5px] text-ink-muted">
                Facebook and Instagram lead forms to CRM leads
              </p>
            </div>
          </div>
          {data && (
            <div className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase',
              data.configured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {data.configured ? (
                <><CheckCircle2 className="w-3 h-3" /> Connected</>
              ) : (
                <><AlertCircle className="w-3 h-3" /> Not configured</>
              )}
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {isLoading && <p className="text-[13px] text-ink-muted">Loading status...</p>}

          {data && (
            <>
              {!data.configured && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-[13.5px] font-semibold text-amber-900 mb-1">Setup needed</p>
                  <p className="text-[13px] text-amber-800 leading-relaxed">
                    Add your Meta app credentials in <code className="bg-amber-100 px-1 rounded">backend/.env</code>:
                  </p>
                  <ul className="text-[12.5px] text-amber-800 mt-2 ml-4 list-disc space-y-0.5">
                    <li><code>META_APP_ID</code></li>
                    <li><code>META_APP_SECRET</code></li>
                    <li><code>META_VERIFY_TOKEN</code></li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-[12.5px] uppercase tracking-wider font-semibold text-ink-muted mb-1.5">
                  Webhook URL (paste into Meta App Dashboard)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={data.webhookUrl}
                    className="flex-1 h-10 px-3 border border-ink-border rounded-md text-[13.5px] bg-ink-bg font-mono text-ink"
                  />
                  <button
                    onClick={() => copy(data.webhookUrl, 'url')}
                    className="h-10 px-3 rounded-md border border-ink-border bg-white hover:border-brand hover:text-brand text-[13px] font-medium transition-colors flex items-center gap-1.5"
                  >
                    {copied === 'url' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>

              {data.verifyToken && (
                <div>
                  <label className="block text-[12.5px] uppercase tracking-wider font-semibold text-ink-muted mb-1.5">
                    Verify Token
                  </label>
                  <input
                    readOnly
                    value={data.verifyToken}
                    className="w-full h-10 px-3 border border-ink-border rounded-md text-[13.5px] bg-ink-bg font-mono text-ink"
                  />
                </div>
              )}

              {data.appId && (
                <div>
                  <label className="block text-[12.5px] uppercase tracking-wider font-semibold text-ink-muted mb-1.5">
                    App ID
                  </label>
                  <input
                    readOnly
                    value={data.appId}
                    className="w-full h-10 px-3 border border-ink-border rounded-md text-[13.5px] bg-ink-bg font-mono text-ink"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-ink-bg rounded-lg p-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Leads from Meta</div>
                  <div className="text-[24px] font-bold text-ink leading-tight mt-1">{data.metaLeadsCount}</div>
                </div>
                <div className="bg-ink-bg rounded-lg p-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Sources</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
                      <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
                      <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                    </span>
                  </div>
                </div>
              </div>

              {data.recentLeads.length > 0 && (
                <div>
                  <h3 className="text-[13.5px] font-semibold text-ink mb-2">Recent Meta leads</h3>
                  <div className="space-y-1.5">
                    {data.recentLeads.map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b border-ink-border last:border-0">
                        <div className="flex items-center gap-2">
                          {l.source === 'instagram' ? (
                            <Instagram className="w-4 h-4 text-pink-600" />
                          ) : (
                            <Facebook className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-[13.5px] text-ink font-medium">{l.name}</span>
                        </div>
                        <span className="text-[12px] text-ink-muted">
                          {new Date(l.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-ink-border">
                <a
                  href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-[13px] text-brand hover:underline"
                >
                  Meta Lead Ads docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-ink-border rounded-xl shadow-sm overflow-hidden opacity-70">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl">💬</div>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">WhatsApp Cloud API</h2>
              <p className="text-[12.5px] text-ink-muted">Send and receive WhatsApp messages</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-gray-100 text-gray-600">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}