/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#f1f5f9',
        'bg-secondary': '#ffffff',
        'bg-card': '#f8fafc',
        'text-primary': '#0f172a',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        'accent': {
          DEFAULT: '#00d9ff',
          light: '#00fff7',
          cyan: '#0891b2',
        },
        'success': '#059669',
        'warning': '#dc2626',
        'warning-medium': '#d97706',
        'border': '#e2e8f0',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'custom-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        'spot-number': '3.5rem',
      }
    },
  },
  plugins: [],
};