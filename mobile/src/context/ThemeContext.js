import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from '../config/debug';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

const ThemeContext = createContext();

const STORAGE_KEY = 'parking_theme';

/**
 * ThemeProvider - Manages app theme (light/dark) with user override.
 *
 * Theme modes:
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 *
 * Persists user preference in AsyncStorage.
 */
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark'); // 'light' | 'dark'

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        debugLog('ThemeProvider: loaded from storage ->', saved);
        if (saved && ['light', 'dark'].includes(saved)) {
          setThemeMode(saved);
          debugLog('ThemeProvider: applied saved theme ->', saved);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
      }
    };
    loadThemePreference();
  }, []);

  // Determine effective color scheme based on mode
  const colorScheme = themeMode;
  const isDark = colorScheme === 'dark';

  // Also sync the global NativeWind color-scheme runtime so `dark:` variants work
  const { setColorScheme: setNativewindColorScheme } = useNativewindColorScheme();

  useEffect(() => {
    try {
      debugLog('ThemeProvider: setting NativeWind color-scheme ->', colorScheme);
      // accept 'light' | 'dark' (nativewind also supports 'system')
      setNativewindColorScheme(colorScheme);
    } catch (e) {
      console.error('Failed to update NativeWind color scheme:', e);
    }
  }, [colorScheme, setNativewindColorScheme]);

  const theme = {
    mode: themeMode, // User preference: 'light' | 'dark'
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
      if (!['light', 'dark'].includes(mode)) {
        console.warn('Invalid theme mode:', mode);
        return;
      }
      try {
        debugLog('ThemeProvider.setTheme: requested ->', mode, 'current ->', themeMode);
        // optimistic update so UI changes immediately, persist afterwards
        setThemeMode(mode);
        debugLog('ThemeProvider.setTheme: optimistic update applied ->', mode);
        await AsyncStorage.setItem(STORAGE_KEY, mode);
        debugLog('ThemeProvider.setTheme: persisted ->', mode);
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
 * - mode: User preference ('light' | 'dark')
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
