import type { Config } from 'tailwindcss';
import preset from '@karpos/config/tailwind';

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
