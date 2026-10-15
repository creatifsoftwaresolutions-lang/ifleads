import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-provider';
import { getErrorMessage } from '@/shared/api/client';

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.com',     password: 'Admin@123', role: 'Admin' },
  { email: 'ceo@demo.com',       password: 'Admin@123', role: 'CEO' },
  { email: 'bdm@demo.com',       password: 'Admin@123', role: 'BDM' },
  { email: 'saleshead@demo.com', password: 'Admin@123', role: 'Sales Head' },
  { email: 'bde@demo.com',       password: 'Admin@123', role: 'BDE' },
];

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #ffffff 85%, #fefafb 100%)',
      }}
    >
      {/* Ribbon SVG background */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[25%] pointer-events-none opacity-40"
        viewBox="0 0 1920 620"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lg1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde4e8" />
            <stop offset="45%" stopColor="#fbc9d0" />
            <stop offset="100%" stopColor="#f6c1c8" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="1.2" /></filter>
          <filter id="blur2"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <path
          d="M -60 620 C 260 460, 640 440, 1000 380 C 1280 330, 1560 280, 1740 200 C 1860 150, 1950 130, 2020 120 L 2020 620 Z"
          fill="url(#lg1)" opacity="0.15" filter="url(#blur2)"
        />
        <path
          d="M -60 560 C 240 430, 560 415, 880 365 C 1180 315, 1480 275, 1660 205 C 1780 160, 1870 145, 1930 180 C 1990 220, 1980 310, 1900 370 C 1810 435, 1660 460, 1500 480 C 1280 505, 1020 520, 760 535 C 480 550, 180 575, -60 610 Z"
          fill="url(#lg1)" opacity="0.20"
        />
        <path
          d="M -60 610 C 220 500, 520 480, 820 430 C 1120 380, 1440 340, 1620 260 C 1750 200, 1850 195, 1930 250 C 2000 300, 1980 380, 1880 430 C 1760 490, 1560 510, 1360 525 C 1080 545, 780 555, 500 575 C 260 592, 80 608, -60 630 Z"
          fill="url(#lg1)" opacity="0.15"
        />
        <path
          d="M -60 520 C 220 420, 520 405, 820 355 C 1120 305, 1420 275, 1600 200 C 1720 150, 1830 155, 1900 210"
          fill="none" stroke="url(#lg2)" strokeWidth="14" strokeLinecap="round" opacity="0.9"
        />
      </svg>

      <form
        onSubmit={onSubmit}
        noValidate
        className="relative z-10 w-full max-w-[400px] bg-white border border-ink-border rounded-2xl px-6 py-7 shadow-lg"
      >
        {/* Logo: if-LEADS inline */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-12 h-12 rounded-md bg-brand flex items-center justify-center shrink-0">
            <span className="text-white font-black text-[32px] leading-none -mt-1">if</span>
          </div>
          <span className="text-[40px] font-black text-ink leading-none tracking-tight">LEADS</span>
        </div>

        <h1 className="text-center text-[22px] font-bold text-ink leading-tight mb-1">
          Welcome Back
        </h1>
        <p className="text-center text-[14px] text-ink-muted mb-5">
          Sign in to continue
        </p>

        <label htmlFor="email" className="block text-[13px] text-ink-muted mb-1">
          Email
        </label>
        <input
          id="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" placeholder="name@company.com"
          className="w-full px-3 py-2.5 border border-ink-border rounded-md text-[14px] bg-white text-ink focus:outline-none focus:border-brand"
        />

        <label htmlFor="pw" className="block text-[13px] text-ink-muted mb-1 mt-3">
          Password
        </label>
        <div className="relative">
          <input
            id="pw" type={showPw ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" placeholder="••••••••"
            className="w-full px-3 py-2.5 pr-16 border border-ink-border rounded-md text-[14px] bg-white text-ink focus:outline-none focus:border-brand"
          />
          <button
            type="button" onClick={() => setShowPw((v) => !v)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 bg-transparent px-2 py-2 text-[13px] text-ink-muted hover:text-ink"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 my-3">
          <label className="flex items-center gap-1.5 text-[13px] text-ink cursor-pointer">
            <input
              type="checkbox" checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-brand"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setError('Password reset links are sent by the server in production.')}
            className="border-0 bg-transparent text-brand text-[13px] font-semibold hover:text-brand-hover"
          >
            Forgot password?
          </button>
        </div>

        <div role="alert" className="min-h-[18px] text-[13px] text-danger mt-1 mb-2">
          {error}
        </div>

        <button
          type="submit" disabled={submitting}
          className="w-full py-3 rounded-md bg-brand text-white font-semibold text-[15px] tracking-wide hover:bg-brand-hover active:bg-brand-press disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Signing in…' : 'LOGIN'}
        </button>

        <details className="mt-4 text-[13px] text-ink-muted">
          <summary className="cursor-pointer select-none">Demo accounts</summary>
          <div className="mt-2 space-y-0.5 font-mono">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email} type="button"
                onClick={() => { setEmail(a.email); setPassword(a.password); setError(''); }}
                className="block w-full text-left py-0.5 text-ink hover:text-brand transition-colors"
              >
                {a.email} · {a.password}
              </button>
            ))}
          </div>
          <p className="mt-3 leading-snug">
            Your role is loaded from your account. You never choose it at login.
          </p>
        </details>
      </form>
    </div>
  );
}