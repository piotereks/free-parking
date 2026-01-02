import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const STORAGE_KEY = 'parking_theme';

/**
 * ThemeProvider - Manages app theme (light/dark) with system detection and user override
 * 
 * Theme modes:
 * - 'auto': Follow system preference (Appearance.getColorScheme())
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 * 
 * Persists user preference in AsyncStorage.
 */
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('auto'); // 'auto' | 'light' | 'dark'
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme() || 'light'
  );

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && ['auto', 'light', 'dark'].includes(saved)) {
          setThemeMode(saved);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
      }
    };
    loadThemePreference();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  // Determine effective color scheme based on mode
  const colorScheme = themeMode === 'auto' ? systemColorScheme : themeMode;
  const isDark = colorScheme === 'dark';

  // Change theme mode and persist to AsyncStorage
  const setTheme = async (mode) => {
    if (!['auto', 'light', 'dark'].includes(mode)) {
      console.warn('Invalid theme mode:', mode);
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

  const theme = {
    mode: themeMode, // User preference: 'auto' | 'light' | 'dark'
    colorScheme, // Effective scheme: 'light' | 'dark'
    isDark, // Boolean convenience
    colors: {
      // Background colors
      background: isDark ? '#000' : '#fff',
      surface: isDark ? '#1a1a1a' : '#f5f5f5',
      card: isDark ? '#222' : '#fff',
      
      // Text colors
      text: isDark ? '#fff' : '#000',
      textSecondary: isDark ? '#aaa' : '#666',
      textMuted: isDark ? '#888' : '#999',
      
      // Border colors
      border: isDark ? '#333' : '#eee',
      borderLight: isDark ? '#2a2a2a' : '#f0f0f0',
      
      // Status colors (age-based)
      statusGreen: isDark ? '#4ade80' : '#22c55e', // <5 min
      statusYellow: isDark ? '#facc15' : '#eab308', // 5-15 min
      statusRed: isDark ? '#f87171' : '#ef4444', // ≥15 min
      
      // Accent colors
      primary: isDark ? '#60a5fa' : '#3b82f6',
      primaryDark: isDark ? '#3b82f6' : '#2563eb',
      
      // Interactive elements
      link: isDark ? '#60a5fa' : '#3b82f6',
      disabled: isDark ? '#444' : '#ccc',
    },
    setTheme,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme hook - Access theme context
 * 
 * Returns:
 * - mode: User preference ('auto' | 'light' | 'dark')
 * - colorScheme: Effective scheme ('light' | 'dark')
 * - isDark: Boolean convenience
 * - colors: Color palette object
 * - setTheme(mode): Function to change theme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
