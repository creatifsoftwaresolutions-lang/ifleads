import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e71d33',
          hover: '#c5162b',
          press: '#a91224',
          light: '#fdebed',
          lightBorder: '#f6c1c8',
          accent: '#fd3a4b',
        },
        ink: {
          DEFAULT: '#050505',
          muted: '#5f6368',
          border: '#e6e3e4',
          bg: '#faf8f8',
          surface: '#ffffff',
        },
        danger: '#b42318',
        wa: '#1faa59',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '9px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(5,5,5,.04)',
        md: '0 4px 12px rgba(5,5,5,.08)',
        lg: '0 10px 40px rgba(5,5,5,.08)',
        modal: '0 8px 30px rgba(5,5,5,.22)',
      },
    },
  },
  plugins: [],
} satisfies Config;
