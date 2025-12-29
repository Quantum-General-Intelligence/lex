import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vulcan Technologies brand palette
        'vulcan': {
          900: '#0f172a', // Deep navy - primary
          800: '#1e293b', // Dark slate
          700: '#334155', // Slate
          600: '#475569', // Medium slate
          500: '#64748b', // Light slate
          400: '#94a3b8', // Muted
          300: '#cbd5e1', // Light
          200: '#e2e8f0', // Lighter
          100: '#f1f5f9', // Lightest
          50: '#f8fafc',  // Near white
        },
        'accent': {
          DEFAULT: '#3b82f6', // Primary blue
          hover: '#2563eb',   // Darker blue
          light: '#dbeafe',   // Light blue bg
          500: '#3b82f6',
          600: '#2563eb',
        },
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        // Keep legacy colors for backward compatibility during migration
        'lex-navy': '#0f172a',
        'lex-gold': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
