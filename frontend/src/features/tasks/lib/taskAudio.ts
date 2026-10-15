let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    return ctx;
  } catch { return null; }
}

export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function playBeep(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const now = c.currentTime;
  [0, 0.4].forEach((delay) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + delay + 0.15);
    osc.connect(gain).connect(c.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.2);
  });
}

export function startAlarmLoop(): () => void {
  playBeep();
  const id = setInterval(playBeep, 1500);
  return () => clearInterval(id);
}
