import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const STORAGE_KEY = 'parking_theme';

// Top-level constant for default theme
const DEFAULT_THEME_MODE = 'dark';

/**
 * ThemeProvider - Manages app theme (light/dark) with system detection and user override
 * 
 * Theme modes:
 * - 'auto': Follow system preference
 * - 'light': Force light mode
 * - 'dark': Force dark mode (DEFAULT)
 * 
 * Persists user preference in AsyncStorage.
 * Colors are managed by Tailwind CSS via tailwind.config.js - use NativeWind classes.
 */
export function ThemeProvider({ children, initialMode }) {
  const [themeMode, setThemeMode] = useState(initialMode || DEFAULT_THEME_MODE);
  const systemColorScheme = useRNColorScheme() || 'dark';

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && ['auto', 'light', 'dark'].includes(stored)) {
          setThemeMode(stored);
        }
      } catch (error) {
        // Ignore storage errors, use default
      }
    };
    void loadTheme();
  }, []);

  // Determine effective color scheme based on mode
  const colorScheme = themeMode === 'auto' ? systemColorScheme : themeMode;
  const isDark = colorScheme === 'dark';

  const setTheme = async (mode) => {
    if (!['auto', 'light', 'dark'].includes(mode)) {
      return;
    }
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Ignore storage errors
    }
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
 * - mode: User preference ('auto' | 'light' | 'dark')
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
