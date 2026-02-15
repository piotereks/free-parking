import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();


// Top-level constant for default theme
const DEFAULT_THEME_MODE = 'dark';

/**
 * ThemeProvider - Manages app theme (light/dark).
 *
 * Only 'light' and 'dark' are supported. The provider uses system color scheme by default,
 * but allows manual override. Pass `initialMode` to set the initial theme.
 */
export function ThemeProvider({ children, initialMode }) {
  const systemColorScheme = useColorScheme();
  const initial = (initialMode === 'light' || initialMode === 'dark') ? initialMode : (systemColorScheme || DEFAULT_THEME_MODE);
  // const initial = systemColorScheme;
  const [themeMode, setThemeMode] = useState(initial);

  // Use manual theme if set, otherwise system
  const colorScheme = themeMode === 'system' ? (systemColorScheme || 'light') : themeMode;
  // const colorScheme = systemColorScheme;
  const isDark = colorScheme === 'dark';

  // Immediate debug log for resolved scheme
  console.log('🎨 ThemeProvider resolved colorScheme', {
    initialMode,
    systemColorScheme,
    themeMode,
    colorScheme,
    isDark,
  });

  // Debug logging
  useEffect(() => {
    console.log('🎨 [ThemeProvider] Mounted:', {
      initialMode,
      systemColorScheme,
      initial,
      themeMode,
      colorScheme,
      isDark,
    });
  }, []);

  useEffect(() => {
    console.log('🎨 [ThemeProvider] Theme changed:', {
      themeMode,
      systemColorScheme,
      colorScheme,
      isDark,
    });
  }, [themeMode, systemColorScheme, colorScheme, isDark]);

  const setTheme = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    console.log('🎨 [ThemeProvider] setTheme called:', mode);
    setThemeMode(mode);
  };

  const theme = {
    mode: themeMode,
    colorScheme,
    isDark,
    setTheme,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme hook - Access theme context
 * 
 * Returns:
 * - mode: User preference ('light' | 'dark')
 * - colorScheme: Effective scheme ('light' | 'dark') - use this to apply 'dark' class
 * - isDark: Boolean convenience
 * - setTheme(mode): Function to change theme
 * 
 * Use NativeWind classes with dark: prefix for styling (e.g., "bg-bg-primary-light dark:bg-bg-primary-dark")
 * All colors come from tailwind.config.js
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Helper: build flattened color maps from tailwind config
/**
 * buildColorMaps(APP_THEME?, systemColorScheme?) -> returns allStyles
 * - APP_THEME: optional string 'light' | 'dark' | 'system' (or null/undefined)
 * - systemColorScheme: optional string 'light' | 'dark' (typically from useColorScheme() passed by the caller)
 *
 * Returns: allStyles object mapping base color keys to flattened tailwind keys
 */
export function buildColorMaps(APP_THEME = null) {
  try {
    const tailwindConfig = require('../../tailwind.config.js');
    const colorObj = tailwindConfig.theme?.extend?.colors || {};
    const lightStyles = {};
    const darkStyles = {};
    const systemColorScheme = useColorScheme();

    // NOTE: do not call React hooks (useColorScheme) from utility functions; caller should pass systemColorScheme.
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
    let colorScheme = systemColorScheme || 'light';
    if (typeof APP_THEME === 'string' && allowed.has(APP_THEME)) {
      if (APP_THEME === 'system') {
        colorScheme = systemColorScheme || 'light';
      } else {
        colorScheme = APP_THEME;
      }
    }

    const allStyles = colorScheme === 'dark' ? darkStyles : lightStyles;
  // const containerClass = allStyles['bg-container'] || '';
  // const textClass = allStyles['text-example'] || '';
    // Debug: report what was found and the resolved scheme
    try {
      console.log('🎨 buildColorMaps', {
        APP_THEME,
        systemColorScheme,
        colorScheme,
        bgContainer: allStyles['bg-container'],
        textExample: allStyles['text-example'],
        // definedColorKeys: Object.keys(colorObj).length,
        // sampleKeys: Object.keys(colorObj).slice(0, 20),
      });
    } catch (e) {
      /* Ignore logging errors */
    }

    return { allStyles, colorScheme };
  } catch (e) {
    return {};
  }
}
