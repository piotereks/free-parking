import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';

const ThemeContext = createContext();

/**
 * ThemeProvider - Simple theme management with NativeWind
 * 
 * This provider manages the color scheme and ensures NativeWind's
 * dark: variants are applied correctly by setting the system appearance.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 * @param {string} props.initialMode - Initial theme mode: 'light', 'dark', or 'system'
 */
export function ThemeProvider({ children, initialMode = 'dark' }) {
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
  // AND set the Appearance so NativeWind picks it up
  useEffect(() => {
    const resolved = getResolvedScheme(themeMode);
    setColorScheme(resolved);
    
    // CRITICAL: Tell React Native (and NativeWind) about the color scheme
    // This makes the dark: variants work
    try {
      Appearance.setColorScheme(resolved);
    } catch (e) {
      console.warn('Failed to set appearance:', e);
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