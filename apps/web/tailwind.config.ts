import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        'bg-secondary': '#0a0a0a',
        'bg-tertiary': '#111111',
        'bg-hover': '#161616',
        border: '#1a1a1a',
        'border-light': '#2a2a2a',
        text: '#ffffff',
        'text-muted': '#888888',
        'text-subtle': '#555555',
        primary: '#6366f1',
        'primary-hover': '#5254cc',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
