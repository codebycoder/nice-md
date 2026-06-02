import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 24px 60px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        chrome: {
          50: '#f7f6f2',
          100: '#efece3',
          200: '#ddd6c5',
          800: '#2d3132',
          900: '#1a1d1e',
        },
        accent: {
          300: '#7cd5bf',
          400: '#3db89b',
          500: '#238f78',
          600: '#1b715f',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
