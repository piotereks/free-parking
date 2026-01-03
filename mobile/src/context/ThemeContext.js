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

  const theme = {
    mode: themeMode, // User preference: 'auto' | 'light' | 'dark'
    colorScheme, // Effective scheme: 'light' | 'dark'
    isDark, // Boolean convenience
    colors: {
      // Background colors (matching web version)
      background: isDark ? '#0a0e27' : '#f1f5f9',
      surface: isDark ? '#141937' : '#ffffff',
      card: isDark ? '#1e2749' : '#f8fafc',
      
      // Text colors (matching web version)
      text: isDark ? '#e0e6ff' : '#0f172a',
      textSecondary: isDark ? '#8b95c9' : '#64748b',
      textMuted: isDark ? '#6b7399' : '#94a3b8',
      
      // Border colors (matching web version)
      border: isDark ? '#2d3b6b' : '#e2e8f0',
      borderLight: isDark ? '#252f5a' : '#f1f5f9',
      
      // Status colors (age-based, matching web version)
      statusGreen: isDark ? '#00ff88' : '#059669', // <5 min
      statusYellow: isDark ? '#ffaa00' : '#d97706', // 5-15 min
      statusRed: isDark ? '#ff3366' : '#dc2626', // ≥15 min
      
      // Accent colors (matching web version)
      primary: isDark ? '#00d9ff' : '#00d9ff',
      accent: isDark ? '#00d9ff' : '#00d9ff',
      
      // Interactive elements
      link: isDark ? '#00d9ff' : '#0891b2',
      disabled: isDark ? '#4a5578' : '#cbd5e1',
    },
    setTheme: async (mode) => {
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
    },
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
