/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Background colors (matching web version)
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
        // Text colors
        'text-primary': {
          light: '#0f172a',
          dark: '#e0e6ff',
        },
        'text-secondary': {
          light: '#64748b',
          dark: '#8b95c9',
        },
        'text-muted': {
          light: '#94a3b8',
          dark: '#6b7399',
        },
        // Accent and semantic colors
        'accent': {
          DEFAULT: '#00d9ff',
          light: '#00fff7',
          cyan: '#0891b2',
        },
        'success': {
          light: '#059669',
          dark: '#00ff88',
        },
        'warning': {
          light: '#dc2626',
          dark: '#ff3366',
          medium: {
            light: '#d97706',
            dark: '#ffaa00',
          }
        },
        // Border colors
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