// Utility: buildColorMaps extracted from ThemeContext
// Pure function - does not call React hooks

export function buildColorMaps(APP_THEME = null, systemColorScheme = null) {
  try {
    const tailwindConfig = require('../../tailwind.config.js');
    const colorObj = tailwindConfig.theme?.extend?.colors || {};
    const lightStyles = {};
    const darkStyles = {};

    // Build light/dark flattened maps from tailwind color keys
    Object.keys(colorObj).forEach((key) => {
      const m = key.match(/^(.*)-(light|dark)$/);
      if (m) {
        const base = m[1];
        const variant = m[2];
        if (variant === 'light') {
          lightStyles[base] = key;
          if (`${base}-dark` in colorObj) darkStyles[base] = `${base}-dark`;
        } else {
          darkStyles[base] = key;
          if (`${base}-light` in colorObj) lightStyles[base] = `${base}-light`;
        }
      } else {
        lightStyles[key] = key;
        darkStyles[key] = key;
      }
    });

    // determine effective color scheme
    const allowed = new Set(['light', 'dark', 'system']);
    let resolvedSystem = systemColorScheme || null;
    let colorScheme = resolvedSystem || 'light';
    if (typeof APP_THEME === 'string' && allowed.has(APP_THEME)) {
      if (APP_THEME === 'system') {
        colorScheme = resolvedSystem || 'light';
      } else {
        colorScheme = APP_THEME;
      }
    }

    const isDark = colorScheme === 'dark';
    const allStyles = isDark ? darkStyles : lightStyles;

    // Debug: report some findings
    try {
      console.log('🎨 buildColorMaps (utils)', {
        APP_THEME,
        colorScheme,
        bgContainer: allStyles['bg-container'],
        textExample: allStyles['text-example'],
      });
    } catch (e) {
      /* ignore */
    }

    return { allStyles, colorScheme, isDark };
  } catch (e) {
    return { allStyles: {}, colorScheme: 'light', isDark: false };
  }
}
