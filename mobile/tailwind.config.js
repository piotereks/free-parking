/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#f1f5f9',
        'bg-secondary': '#ffffff',
        'bg-card': '#f8fafc',
        // Text colors
        // 'primary': '#ff0000',
        'text-primary': '#0f172a',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        'text-success': '#059669',
        'text-warning': '#dc2626',
        'text-warning-medium': '#d97706',

        // Accent and semantic colors
        'accent': {
          DEFAULT: '#00d9ff',
          light: '#00fff7',
          cyan: '#0891b2',
          'cyan-light': '#06b6d4',
        },

        'notice': '#fefce8',
        'notice-border': '#fef08a',
        'notice-text': '#fde047',
        // Border colors
        'border': '#e2e8f0',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'custom-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'hover-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hover-dark': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'header-light': '0 1px 10px rgba(0, 0, 0, 0.2)',
        'header-dark': '0 1px 10px rgba(0, 0, 0, 0.2)',
      },
      fontSize: {
        'spot-number': '3.5rem',
      }
    },
  },
  plugins: [],
};