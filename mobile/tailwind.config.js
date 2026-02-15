/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Reference/example styles (flattened)
        'bg-container-light': '#059669',
        'bg-container-dark': '#1e293b',
        'text-example-light': '#ff293b',
        'text-example-dark': '#f8fafc',

        // Backgrounds (flat DEFAULT + light/dark)
        'bg-primary-light': '#f1f5f9',
        'bg-primary-dark': '#0a0e27',
        'bg-secondary-light': '#ffffff',
        'bg-secondary-dark': '#141937',
        'bg-card-light': '#f8fafc',
        'bg-card-dark': '#1e2749',

        // Text
        'text-primary-light': '#0f172a',
        'text-primary-dark': '#e0e6ff',
        'text-secondary-light': '#64748b',
        'text-secondary-dark': '#8b95c9',
        'text-muted': '#94a3b8',
        'text-success-light': '#059669',
        'text-success-dark': '#00ff88',

        // Warnings (both nested + flat "medium" token kept for mobile)
        'text-warning-light': '#dc2626',
        'text-warning-dark': '#ff3366',
        'text-warning-medium-light': '#d97706',
        'text-warning-medium-dark': '#ffaa00',

        // Accent / semantic colors
        'accent-light': '#00fff7',
        'accent-cyan': '#0891b2',
        'accent-cyan-light': '#06b6d4',

        'notice-light': '#fefce8',
        'notice-dark': '#713f12',
        'notice-border-light': '#fef08a',
        'notice-border-dark': '#a16207',
        'notice-text-light': '#fde047',
        'notice-text-dark': '#854d0e',

        // Borders
        'border-light': '#e2e8f0',
        'border-dark': '#2d3b6b'
      },

      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },

      borderRadius: {
        card: '0.75rem',
      },

      boxShadow: {
        'custom-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'hover-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hover-dark': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'header-light': '0 1px 10px rgba(0, 0, 0, 0.2)',
        'header-dark': '0 1px 10px rgba(0, 0, 0, 0.2)'
      },

      fontSize: {
        'spot-number': '3.5rem',
        'spot-number-mobile': '5.2rem',
      },

      transitionProperty: {
        theme: 'background-color, color, border-color',
      },
    },
  },
  plugins: [],
};