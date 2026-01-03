/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./native-app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Background colors
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
        // Accent and semantic colors
        'accent': {
          DEFAULT: '#00d9ff',
          light: '#00fff7',
          cyan: '#0891b2',
          'cyan-light': '#06b6d4',
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
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
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
        'spot-number-mobile': '5.2rem',
      },
      transitionProperty: {
        'theme': 'background-color, color, border-color',
      },
    },
  },
  plugins: [
    require('nativewind/tailwind')
  ],
}