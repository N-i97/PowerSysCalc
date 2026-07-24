import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm-cool paper substrate (deliberately NOT the warm cream AI default)
        paper: {
          DEFAULT: '#F2EFE8',
          deep:    '#E7E2D6',
          bright:  '#F8F5EE',
        },
        // Deep navy ink (echoes the brand polarity, flipped light)
        ink: {
          DEFAULT: '#0E1726',
          900:     '#0E1726',
          800:     '#1A2236',
          700:     '#2A3346',
          600:     '#3A4A5E',
          500:     '#5A6B82',
          400:     '#6B7A8F',
          300:     '#94A0B3',
          200:     '#B8C0CC',
          100:     '#DDE1E8',
        },
        // Warm rule lines (hairlines in datasheet print)
        rule: {
          DEFAULT: '#BFB7A5',
          soft:    '#D5CCBA',
          thick:   '#8B8470',
        },
        // Single hot "live current" accent — the ONE color
        live: {
          DEFAULT: '#C9351B',
          50:      '#FBE8E2',
          100:     '#F4C9BC',
          200:     '#E89577',
          300:     '#DC6743',
          400:     '#D2451F',
          500:     '#C9351B',
          600:     '#A82A14',
          700:     '#821E0C',
        },
        // OK green — used sparingly, only for status:ok
        ok: {
          DEFAULT: '#1B6A45',
          light:   '#2A8C5C',
        },
        // Signal semantics
        signal: {
          ok:   '#1B6A45',
          warn: '#B6781A',
          err:  '#A8201A',
          info: '#2A5A8C',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      letterSpacing: {
        spec:     '0.02em',  // sub-heading
        datasheet:'0.08em',  // section eyebrows
        nameplate:'0.18em',  // nameplate caps
      },
      borderRadius: {
        none: '0',
        xs:   '1px',
        sm:   '2px',
        DEFAULT: '2px',
      },
      boxShadow: {
        paper:   '0 1px 0 0 rgba(14,23,38,0.04), 0 0 0 1px rgba(14,23,38,0.06)',
        rule:    '0 1px 0 0 rgba(14,23,38,0.08)',
        engrave: 'inset 0 1px 0 0 rgba(255,255,255,0.5), inset 0 -1px 0 0 rgba(14,23,38,0.08)',
        live:    '0 0 0 1px rgba(201,53,27,0.45), 0 4px 14px -4px rgba(201,53,27,0.25)',
      },
      backgroundImage: {
        'paper-grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.06 0 0 0 0 0.09 0 0 0 0 0.15 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'grid-faint':
          'linear-gradient(rgba(14,23,38,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,23,38,0.05) 1px, transparent 1px)',
        'grid-print':
          'linear-gradient(rgba(14,23,38,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,23,38,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-24': '24px 24px',
        'grid-32': '32px 32px',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up':  { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-dot':{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        'engrave':  { '0%': { letterSpacing: '0.5em', opacity: '0' }, '100%': { letterSpacing: '0.18em', opacity: '1' } },
        'rule-in':  { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-in':   'fade-in 200ms ease-out',
        'fade-up':   'fade-up 240ms ease-out',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'engrave':   'engrave 600ms ease-out both',
        'rule-in':   'rule-in 500ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
