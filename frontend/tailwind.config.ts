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
        // Dark theme palette
        'vulcan': {
          950: '#050709', // Deepest black
          900: '#0a0e1a', // Primary background
          850: '#0d1220', // Slightly lighter bg
          800: '#111827', // Card backgrounds
          700: '#1c2333', // Elevated surfaces
          600: '#2a3349', // Borders, dividers
          500: '#4a5568', // Muted text
          400: '#718096', // Secondary text
          300: '#a0aec0', // Body text
          200: '#cbd5e0', // Light text
          100: '#e2e8f0', // Bright text
          50: '#f7fafc',  // White text
        },
        'accent': {
          DEFAULT: '#3b82f6', // Primary blue
          hover: '#2563eb',   // Darker blue
          light: '#60a5fa',   // Lighter blue
          glow: '#3b82f6',    // For glows/shadows
          500: '#3b82f6',
          600: '#2563eb',
          400: '#60a5fa',
        },
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
