import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';
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
  // Force light mode only
  const [themeMode, setThemeMode] = useState('light');
  const [systemColorScheme, setSystemColorScheme] = useState('light');

  // Load theme preference from AsyncStorage on mount
  // No-op: always light mode

  // Listen to system color scheme changes
  // No-op: always light mode

  // Determine effective color scheme based on mode
  const colorScheme = 'light';
  const isDark = false;

  const theme = {
    mode: 'light',
    colorScheme: 'light',
    isDark: false,
    colors: {
      background: '#f1f5f9',
      surface: '#ffffff',
      card: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      statusGreen: '#059669',
      statusYellow: '#d97706',
      statusRed: '#dc2626',
      primary: '#00d9ff',
      accent: '#00d9ff',
      link: '#0891b2',
      disabled: '#cbd5e1',
    },
    setTheme: async () => {}, // No-op
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme hook - Access theme context
 * 
 * Returns:
 * - mode: User preference ('auto' | 'light' | 'dark')
 * - colorScheme: Effective scheme ('light' | 'dark') - use this for NativeWind className="dark:..."
 * - isDark: Boolean convenience
 * - colors: Color palette object (legacy, use NativeWind classes instead)
 * - setTheme(mode): Function to change theme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
