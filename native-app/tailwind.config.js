// tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': {
          light: '#f1f5f9',
          dark: '#0a0e27',
        },
        'bg-secondary': {
          light: '#ffffff',
          dark: '#141937',
        },
        'bg-card': {
          light: '#f8fafc',
          dark: '#1e2749',
        },
        'text-primary': {
          light: '#0f172a',
          dark: '#e0e6ff',
        },
        'text-secondary': {
          light: '#64748b',
          dark: '#8b95c9',
        },
        'accent': {
          DEFAULT: '#00d9ff',
          light: '#00fff7',
        },
        'success': {
          light: '#059669',
          dark: '#00ff88',
        },
        'warning': {
          light: '#dc2626',
          dark: '#ff3366',
        },
        'border': {
          light: '#e2e8f0',
          dark: '#2d3b6b',
        },
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'custom-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 1px 3px rgba(0, 0, 0, 0.4)',
      },
      fontSize: {
        'spot-number': '3.5rem',
      }
    },
  },
  plugins: [],
};