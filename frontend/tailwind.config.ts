import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        navy: {
          950: '#020817',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        glass: {
          bg:     'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.10)',
          hover:  'rgba(255,255,255,0.08)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.08), transparent)',
        'gradient-brand': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 15px rgba(59,130,246,0.15)',
        'glow-md':  '0 0 30px rgba(59,130,246,0.20)',
        'glow-lg':  '0 0 60px rgba(59,130,246,0.25)',
        'card':     '0 4px 24px rgba(0,0,0,0.40)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.50)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        'card': '16px',
      },
      animation: {
        'fade-in':    'fade-in 0.4s ease both',
        'slide-up':   'slide-up 0.5s ease both',
        'scale-in':   'scale-in 0.35s ease both',
        'float':      'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow':  'spin-slow 20s linear infinite',
        'shimmer':    'shimmer 3s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(59,130,246,0.5)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
