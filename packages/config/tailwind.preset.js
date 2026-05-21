// Karpos DS v2 — Tailwind preset.
// Tone: professional SaaS, dense data, sidebar oscuro, acento esmeralda.

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Brand accents (esmeralda + ámbar para alerts)
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Neutral (zinc-like): backgrounds, text, borders
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Semantic
        success: { 50: '#ecfdf5', 500: '#10b981', 600: '#059669', 700: '#047857' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        info:    { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['11px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '20px'],
        lg: ['16px', '24px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(9,9,11,0.05)',
        sm: '0 1px 3px 0 rgba(9,9,11,0.07), 0 1px 2px -1px rgba(9,9,11,0.07)',
        md: '0 4px 6px -1px rgba(9,9,11,0.08), 0 2px 4px -2px rgba(9,9,11,0.06)',
        lg: '0 10px 15px -3px rgba(9,9,11,0.08), 0 4px 6px -4px rgba(9,9,11,0.06)',
        focus: '0 0 0 3px rgba(16,185,129,0.20)',
      },
    },
  },
};
