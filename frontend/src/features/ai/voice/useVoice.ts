import { useRef, useState, useCallback, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
  /** Language for speech RECOGNITION (listening). Auto-detection is used for speech output. */
  lang?: string;
}

// ─────────────────────────────────────────────────────────────
// Clean markdown + emojis so TTS reads natural sentences
// ─────────────────────────────────────────────────────────────
function cleanForSpeech(raw: string): string {
  if (!raw) return '';
  let t = raw;

  // Remove markdown bold/italic
  t = t.replace(/\*\*(.+?)\*\*/g, '$1');
  t = t.replace(/__(.+?)__/g, '$1');
  t = t.replace(/\*(.+?)\*/g, '$1');
  t = t.replace(/_(.+?)_/g, '$1');

  // Remove headers (### → )
  t = t.replace(/^#+\s+/gm, '');

  // Remove bullet markers at line start
  t = t.replace(/^\s*[•\-*]\s+/gm, '');
  t = t.replace(/^\s*\d+\.\s+/gm, '');

  // Remove inline code
  t = t.replace(/`([^`]+)`/g, '$1');
  t = t.replace(/```[\s\S]*?```/g, '');

  // Remove remaining stray markdown chars
  t = t.replace(/[`*_#>]/g, '');

  // Remove emojis + symbols (keep basic punctuation)
  t = t.replace(
    /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2700}-\u{27BF}]/gu,
    ''
  );

  // Turn bullets into commas (natural speech)
  t = t.replace(/•/g, ', ');

  // Turn newlines into natural pauses
  t = t.replace(/\n{2,}/g, '. ');
  t = t.replace(/\n/g, '. ');

  // Collapse repeated punctuation
  t = t.replace(/\.{2,}/g, '.');
  t = t.replace(/,\s*,/g, ',');
  t = t.replace(/\s{2,}/g, ' ');
  t = t.replace(/^[.,:;\s]+/, '');

  return t.trim();
}

// ─────────────────────────────────────────────────────────────
// Detect language from text content
// ─────────────────────────────────────────────────────────────
function detectLang(text: string, fallback: string): string {
  // Malayalam: U+0D00–U+0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Devanagari (Hindi): U+0900–U+097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  // Tamil: U+0B80–U+0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  return fallback;
}

// ─────────────────────────────────────────────────────────────
// Pick highest-quality voice for a given language
// ─────────────────────────────────────────────────────────────
let cachedVoices: SpeechSynthesisVoice[] = [];

function getVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

function pickBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = getVoices();
  if (voices.length === 0) return null;

  const langPrefix = lang.split('-')[0];

  // Priority order — prefer natural/neural voices
  const priorities = [
    /Google.*(Natural|Neural|Wavenet)/i,
    /Microsoft.*(Natural|Neural|Online)/i,
    /Samantha|Daniel|Alex/i,
    /Google/i,
    /Microsoft/i,
    /Siri/i,
  ];

  for (const rx of priorities) {
    const match = voices.find(
      (v) => v.lang.toLowerCase().startsWith(langPrefix) && rx.test(v.name)
    );
    if (match) return match;
  }

  // Then: exact language match
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  // Then: any voice with matching prefix
  const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (prefix) return prefix;

  // Fallback
  return voices[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useVoice({ onTranscript, lang = 'en-IN' }: UseVoiceOptions) {
  const [state, setState] = useState<VoiceState>('idle');
  const recRef = useRef<any>(null);
  const supported =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Pre-load voices once available (Chrome fires voiceschanged async)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
    };
  }, []);

  const startListening = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setState('error');
      return false;
    }

    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
      return true;
    }

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      setState('thinking');
      onTranscript(transcript);
    };
    rec.onerror = () => {
      setState('error');
      recRef.current = null;
      setTimeout(() => setState('idle'), 1500);
    };
    rec.onend = () => {
      recRef.current = null;
      setState((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recRef.current = rec;
    setState('listening');
    rec.start();
    return true;
  }, [lang, onTranscript]);

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
    }
  }, []);

  const speak = useCallback(
    (rawText: string) => {
      if (!('speechSynthesis' in window)) return;

      // 1. Clean the text (remove **, emojis, bullets)
      const text = cleanForSpeech(rawText);
      if (!text) {
        setState('idle');
        return;
      }

      // 2. Detect language from content
      const detected = detectLang(text, lang);

      // 3. Cancel any current speech
      try { window.speechSynthesis.cancel(); } catch {}

      // 4. Chunk long text so browser doesn't time out
      const maxLen = 2500;
      const chunks: string[] = [];
      if (text.length <= maxLen) {
        chunks.push(text);
      } else {
        // Split on sentence boundaries
        const sentences = text.split(/(?<=[.!?])\s+/);
        let cur = '';
        for (const s of sentences) {
          if ((cur + ' ' + s).length > maxLen && cur) {
            chunks.push(cur.trim());
            cur = s;
          } else {
            cur = cur ? cur + ' ' + s : s;
          }
        }
        if (cur) chunks.push(cur.trim());
      }

      // 5. Queue utterances
      setState('speaking');
      const voice = pickBestVoice(detected);

      chunks.forEach((chunk, idx) => {
        const u = new SpeechSynthesisUtterance(chunk);
        u.lang = detected;
        u.rate = 0.92;      // slower = clearer
        u.pitch = 1;
        u.volume = 1;
        if (voice) u.voice = voice;

        if (idx === 0) {
          u.onstart = () => setState('speaking');
        }
        if (idx === chunks.length - 1) {
          u.onend = () => setState('idle');
          u.onerror = () => setState('idle');
        }

        window.speechSynthesis.speak(u);
      });
    },
    [lang]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
      setState('idle');
    }
  }, []);

  const setIdle = useCallback(() => setState('idle'), []);

  return {
    state,
    supported: Boolean(supported),
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setIdle,
  };
}
