/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // NativeWind uses class-based dark mode
  theme: {
    extend: {
      colors: {
        // Backgrounds - use bg-primary, dark:bg-primary-dark
        primary: {
          DEFAULT: '#f1f5f9',
          dark: '#0a0e27',
        },
        secondary: {
          DEFAULT: '#ffffff',
          dark: '#141937',
        },
        card: {
          DEFAULT: '#f8fafc',
          dark: '#1e2749',
        },
        
        // Text colors - use text-foreground, dark:text-foreground-dark
        foreground: {
          DEFAULT: '#0f172a',
          dark: '#e0e6ff',
        },
        muted: {
          DEFAULT: '#64748b',
          dark: '#8b95c9',
        },
        
        // Status colors
        success: {
          DEFAULT: '#059669',
          dark: '#00ff88',
        },
        warning: {
          DEFAULT: '#dc2626',
          dark: '#ff3366',
        },
        'warning-medium': {
          DEFAULT: '#d97706',
          dark: '#ffaa00',
        },
        
        // Border - use border-border, dark:border-border-dark
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#2d3b6b',
        },
        
        // Accent colors
        accent: {
          DEFAULT: '#00fff7',
          dark: '#00fff7',
        },
        'accent-cyan': {
          DEFAULT: '#0891b2',
          light: '#06b6d4',
        },
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
      },
      fontSize: {
        'spot-number': '3.5rem',
        'spot-number-mobile': '5.2rem',
      },
    },
  },
  plugins: [],
};