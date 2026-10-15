/**
 * iF LEADS signature background.
 * Layered bezier ribbons in brand reds + soft pink wash.
 * Rendered as inline SVG so it stays crisp and lightweight.
 */
export function RibbonBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Soft blush wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 20% 100%, #fdebed 0%, #fff9f9 45%, #ffffff 100%)',
        }}
      />

      {/* Flowing red ribbon strokes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ribbon1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e71d33" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#fd3a4b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f6c1c8" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="ribbon2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fd3a4b" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e71d33" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="highlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Bottom-left large ribbon */}
        <path
          d="M -100 1180
             C 180 900, 520 980, 780 760
             C 1020 560, 1280 620, 1560 380
             C 1720 240, 1880 260, 2020 180
             L 2020 320
             C 1880 400, 1720 380, 1560 520
             C 1280 760, 1020 700, 780 900
             C 520 1120, 180 1040, -100 1320 Z"
          fill="url(#ribbon1)"
        />

        {/* Second thinner ribbon overlay */}
        <path
          d="M -100 1120
             C 200 880, 500 940, 760 720
             C 1000 520, 1260 580, 1540 340
             C 1700 200, 1860 220, 2020 140
             L 2020 200
             C 1860 280, 1700 260, 1540 400
             C 1260 640, 1000 580, 760 780
             C 500 1000, 200 940, -100 1180 Z"
          fill="url(#ribbon2)"
          filter="url(#soft)"
        />

        {/* Right-side accent ribbon */}
        <path
          d="M 1400 1180
             C 1520 1000, 1700 980, 1820 860
             C 1900 780, 1980 800, 2100 720
             L 2100 1180 Z"
          fill="url(#ribbon2)"
          opacity="0.35"
          filter="url(#soft)"
        />

        {/* White highlight strokes */}
        <path
          d="M -100 1080
             C 220 860, 540 900, 800 690
             C 1040 500, 1300 560, 1580 320"
          fill="none"
          stroke="url(#highlight)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M -100 1180
             C 220 960, 540 1000, 800 790
             C 1040 600, 1300 660, 1580 420"
          fill="none"
          stroke="url(#highlight)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>

      {/* Top fade so header area stays clean */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />
    </div>
  );
}
