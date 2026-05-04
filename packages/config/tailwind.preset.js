// Karpos DS — Tailwind preset (mirrors docs/brand/tokens.json)
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        karpos: {
          leaf: '#0E5C3A',
          'leaf-hover': '#0A4A2E',
          sprout: '#3FA66B',
          bark: '#3B2A1F',
          clay: '#C0653B',
          amber: '#F0B23C',
          cream: '#FAF7F2',
          fog: '#ECECE8',
          slate: '#1B2A29',
        },
        success: '#2E7D4F',
        warning: '#E89A2C',
        danger: '#B53A2E',
        info: '#2B6FA6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(27,42,41,0.08)',
        md: '0 4px 8px rgba(27,42,41,0.10), 0 1px 2px rgba(27,42,41,0.06)',
        lg: '0 12px 24px rgba(27,42,41,0.12)',
      },
    },
  },
};
