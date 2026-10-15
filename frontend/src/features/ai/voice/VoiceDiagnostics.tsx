import { useState } from 'react';
import { Volume2, X } from 'lucide-react';

export function VoiceDiagnostics() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const loadVoices = () => {
    const list = window.speechSynthesis.getVoices();
    setVoices(list);
    setOpen(true);
  };

  const testLang = (lang: string) => {
    const samples: Record<string, string> = {
      'en-IN': 'Hello, this is a test of Indian English voice.',
      'ml-IN': 'നമസ്കാരം, ഞാൻ നിങ്ങളുടെ സഹായി ആണ്.',
      'hi-IN': 'नमस्ते, मैं आपका सहायक हूँ।',
      'ta-IN': 'வணக்கம், நான் உங்கள் உதவியாளர்.',
    };
    const text = samples[lang] ?? samples['en-IN'];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = voices.find((x) => x.lang.toLowerCase().startsWith(lang.split('-')[0]));
    if (v) u.voice = v;
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const malayalam = voices.filter((v) => v.lang.toLowerCase().startsWith('ml'));
  const indian = voices.filter((v) => v.lang.toLowerCase().endsWith('-in'));
  const natural = voices.filter((v) => /Natural|Neural|Online/i.test(v.name));

  return (
    <>
      <button
        onClick={loadVoices}
        className="fixed bottom-4 left-4 z-[60] w-10 h-10 rounded-full bg-white border border-ink-border shadow-lg grid place-items-center hover:border-brand"
        title="Voice Diagnostics"
      >
        <Volume2 className="w-4 h-4 text-ink-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[90vw] max-w-[720px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border">
              <h2 className="text-[16px] font-semibold text-ink">Voice Diagnostics</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-md text-ink-muted hover:bg-brand-light">
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-ink-bg rounded-lg p-3 text-center">
                  <div className="text-[11px] uppercase text-ink-muted font-semibold">Total voices</div>
                  <div className="text-[24px] font-bold text-ink">{voices.length}</div>
                </div>
                <div className={`rounded-lg p-3 text-center ${malayalam.length > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div className="text-[11px] uppercase text-ink-muted font-semibold">Malayalam</div>
                  <div className={`text-[24px] font-bold ${malayalam.length > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {malayalam.length}
                  </div>
                </div>
                <div className={`rounded-lg p-3 text-center ${natural.length > 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
                  <div className="text-[11px] uppercase text-ink-muted font-semibold">Natural voices</div>
                  <div className="text-[24px] font-bold text-blue-700">{natural.length}</div>
                </div>
              </div>

              {/* Quick test buttons */}
              <div>
                <div className="text-[12px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
                  Quick sound test
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => testLang('en-IN')} className="px-3 py-1.5 rounded-md bg-brand text-white text-[12.5px] hover:bg-brand-hover">
                    🔊 English (India)
                  </button>
                  <button onClick={() => testLang('ml-IN')} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[12.5px] hover:bg-emerald-700">
                    🔊 മലയാളം
                  </button>
                  <button onClick={() => testLang('hi-IN')} className="px-3 py-1.5 rounded-md bg-orange-600 text-white text-[12.5px] hover:bg-orange-700">
                    🔊 हिंदी
                  </button>
                  <button onClick={() => testLang('ta-IN')} className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-[12.5px] hover:bg-purple-700">
                    🔊 தமிழ்
                  </button>
                </div>
              </div>

              {/* Full list */}
              <div>
                <div className="text-[12px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
                  All {voices.length} voices
                </div>
                <div className="border border-ink-border rounded-lg overflow-hidden">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-ink-bg">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-brand">Name</th>
                        <th className="text-left px-3 py-2 font-semibold text-brand">Lang</th>
                        <th className="text-center px-3 py-2 font-semibold text-brand">Test</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voices.map((v, i) => (
                        <tr key={i} className="border-t border-ink-border">
                          <td className="px-3 py-1.5">{v.name}</td>
                          <td className="px-3 py-1.5 font-mono text-[11.5px] text-ink-muted">{v.lang}</td>
                          <td className="px-3 py-1.5 text-center">
                            <button
                              onClick={() => {
                                const u = new SpeechSynthesisUtterance('This is a test.');
                                u.voice = v;
                                u.lang = v.lang;
                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(u);
                              }}
                              className="text-brand hover:underline text-[11.5px]"
                            >
                              play
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* If no Malayalam */}
              {malayalam.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-800">
                  <strong>No Malayalam voice installed.</strong>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Open <strong>Windows Settings → Time & Language → Language</strong></li>
                    <li>Add <strong>Malayalam</strong> → check <strong>Speech</strong> ✅</li>
                    <li>Wait for download → restart browser</li>
                    <li>Or open this page in <strong>Microsoft Edge</strong> for instant Malayalam voice</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
