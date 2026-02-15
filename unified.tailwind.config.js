/**
 * unitfied.tailwind.config.js — unified Tailwind configuration for web + mobile
 *
 * - Keeps both "flat" DEFAULT tokens (used by mobile) and light/dark nested tokens
 *   (used by web) so existing classes remain valid in both projects.
 * - Exported as CommonJS but also exposes `.default` for ESM import compatibility.
 *
 * Quick usage:
 *  - mobile: require this file and merge into `module.exports`.
 *  - web: import this file and spread into the ESM `export default`.
 */

const shared = {
  // default content covers both projects when the config is referenced from repo root
  content: [
    './web/index.html',
    './web/src/**/*.{js,ts,jsx,tsx}',
    './mobile/App.{js,jsx,ts,tsx}',
    './mobile/src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Backgrounds (flat DEFAULT + light/dark) */
        'bg-primary': { light: '#f1f5f9', dark: '#0a0e27' },
        'bg-secondary': { light: '#ffffff', dark: '#141937' },
        'bg-card': { light: '#f8fafc', dark: '#1e2749' },

        /* Text */
        'text-primary': { light: '#0f172a', dark: '#e0e6ff' },
        'text-secondary': { light: '#64748b', dark: '#8b95c9' },
        'text-muted': '#94a3b8',
        'text-success': { light: '#059669', dark: '#00ff88' },

        /* Warnings (both nested + flat "medium" token kept for mobile) */
        'text-warning': {
          light: '#dc2626',
          dark: '#ff3366',
          medium: { light: '#d97706', dark: '#ffaa00' },
        },
        'text-warning-medium': { light: '#d97706', dark: '#ffaa00' },

        /* Accent / semantic colors */
        accent: { light: '#00fff7', cyan: '#0891b2', 'cyan-light': '#06b6d4' },

        notice: { light: '#fefce8', dark: '#713f12' },
        'notice-border': { light: '#fef08a', dark: '#a16207' },
        'notice-text': { light: '#fde047', dark: '#854d0e' },

        /* Borders */
        border: { light: '#e2e8f0', dark: '#2d3b6b' },
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
        'header-dark': '0 1px 10px rgba(0, 0, 0, 0.2)',
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

// helper to quickly produce a project-specific config
shared.createConfig = (content = shared.content, overrides = {}) => ({ ...shared, content, ...overrides });

module.exports = shared;
// support `import shared from '.../unitfied.tailwind.config.js'` in ESM files
module.exports.default = shared;
