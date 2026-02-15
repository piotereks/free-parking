import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

/**
 * ThemeProvider - Manages app theme (light/dark).
 *
 * Only 'light' and 'dark' are supported. The provider uses system color scheme by default,
 * but allows manual override. Pass `initialMode` to set the initial theme.
 */
export function ThemeProvider({ children, initialMode }) {
  const systemColorScheme = useColorScheme();
  
  // Resolve initial color scheme
  const getResolvedScheme = (mode) => {
    if (mode === 'system') {
      return systemColorScheme || 'light';
    }
    return mode;
  };
  
  const [themeMode, setThemeMode] = useState(initialMode);
  const [colorScheme, setColorScheme] = useState(getResolvedScheme(initialMode));
  
  // Update colorScheme when themeMode or system preference changes
  useEffect(() => {
    const resolved = getResolvedScheme(themeMode);
    setColorScheme(resolved);
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