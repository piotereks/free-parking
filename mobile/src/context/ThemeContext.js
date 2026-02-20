import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme as useRNColorScheme, Appearance } from 'react-native';
import { useColorScheme as useNWColorScheme } from 'nativewind';

const ThemeContext = createContext();

/**
 * ThemeProvider - Theme management wired to NativeWind's internal store.
 *
 * NativeWind v2 maintains its own ColorSchemeStore.  Calling
 * `Appearance.setColorScheme()` does NOT reliably propagate to NativeWind.
 * We therefore call NativeWind's `setColorScheme()` directly via the
 * `useColorScheme()` hook it exports.
 *
 * @param {Object}  props
 * @param {ReactNode} props.children
 * @param {string}  props.initialMode - 'light' | 'dark' | 'system'
 */
export function ThemeProvider({ children, initialMode = 'dark' }) {
  const systemColorScheme = useRNColorScheme();
  const nw = useNWColorScheme();          // NativeWind's own hook
  const didInit = useRef(false);

  // Resolve effective scheme
  const getResolvedScheme = (mode) => {
    if (mode === 'system') return systemColorScheme || 'light';
    return mode;
  };

  const [themeMode, setThemeMode] = useState(initialMode);
  const [colorScheme, setLocalColorScheme] = useState(getResolvedScheme(initialMode));

  // ── Sync NativeWind + RN Appearance on every theme change ──
  useEffect(() => {
    const resolved = getResolvedScheme(themeMode);
    setLocalColorScheme(resolved);

    // 1) Tell NativeWind directly (this is the critical call)
    try {
      nw.setColorScheme(resolved);
    } catch (e) {
      console.warn('[ThemeProvider] NativeWind setColorScheme failed:', e);
    }

    // 2) Also keep the RN Appearance in sync (status bar, system UI)
    try {
      Appearance.setColorScheme(resolved);
    } catch (e) {
      console.warn('[ThemeProvider] Appearance.setColorScheme failed:', e);
    }

    // ── Diagnostic log (safe to remove once dark mode works) ──
    if (!didInit.current) {
      didInit.current = true;
      console.log('[ThemeProvider] ── Dark-mode diagnostics ──');
      console.log('  APP_THEME / initialMode :', initialMode);
      console.log('  resolved scheme         :', resolved);
      console.log('  Appearance.getColorScheme():', Appearance.getColorScheme());
      console.log('  NativeWind colorScheme  :', nw.colorScheme);
      console.log('  systemColorScheme (RN)  :', systemColorScheme);
    }
  }, [themeMode, systemColorScheme]);

  const setTheme = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    setThemeMode(mode);
  };

  const isDark = colorScheme === 'dark';

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
 * - mode: User preference ('light' | 'dark' | 'system')
 * - colorScheme: Effective scheme ('light' | 'dark')
 * - isDark: Boolean convenience
 * - setTheme(mode): Function to change theme
 * 
 * Usage with NativeWind:
 * ```jsx
 * const { isDark } = useTheme();
 * 
 * // Use dark: prefix for dark mode variants
 * <View className="bg-primary dark:bg-primary-dark">
 *   <Text className="text-foreground dark:text-foreground-dark">
 *     Hello World
 *   </Text>
 * </View>
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}