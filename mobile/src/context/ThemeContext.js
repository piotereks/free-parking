import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from '../config/debug';
import { useColorScheme } from 'nativewind';

const ThemeContext = createContext();

const STORAGE_KEY = 'parking_theme';

// Synchronously load initial theme from storage (before first render)
function getInitialTheme() {
  // Default to 'dark' - will be overridden by useEffect if storage has different value
  return 'dark';
}

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
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const { colorScheme, setColorScheme } = useColorScheme();

  // Load theme preference from AsyncStorage on mount AND set colorScheme
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        debugLog('ThemeProvider: loaded from storage ->', saved);
        if (saved && ['light', 'dark'].includes(saved)) {
          setThemeMode(saved);
          setColorScheme(saved);
          debugLog('ThemeProvider: applied saved theme ->', saved);
        } else {
          // No saved preference, set NativeWind to match default
          setColorScheme(themeMode);
          debugLog('ThemeProvider: using default theme ->', themeMode);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
        setColorScheme(themeMode); // Fallback to default
      }
    };
    loadThemePreference();
  }, [setColorScheme]);

  // Sync NativeWind when themeMode changes
  useEffect(() => {
    setColorScheme(themeMode);
    debugLog('ThemeProvider: synced NativeWind colorScheme ->', themeMode);
  }, [themeMode, setColorScheme]);

  // Debug: Log what useColorScheme hook returns
  useEffect(() => {
    debugLog('ThemeProvider: useColorScheme hook reports colorScheme ->', colorScheme);
  }, [colorScheme]);

  // Determine effective color scheme from NativeWind hook
  const effectiveColorScheme = colorScheme || themeMode;
  const isDark = effectiveColorScheme === 'dark';

  // Memoize colors object to prevent unnecessary re-renders
  const colors = useMemo(() => ({
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
  }), [isDark]);

  // Memoize setTheme to prevent unnecessary re-renders
  const handleSetTheme = useCallback(async (mode) => {
    if (!['light', 'dark'].includes(mode)) {
      console.warn('Invalid theme mode:', mode);
      return;
    }
    try {
      debugLog('ThemeProvider.setTheme: requested ->', mode, 'current ->', themeMode);
      // Update NativeWind colorScheme immediately via hook
      setColorScheme(mode);
      debugLog('ThemeProvider.setTheme: NativeWind colorScheme set ->', mode);
      // Update state
      setThemeMode(mode);
      debugLog('ThemeProvider.setTheme: state updated ->', mode);
      // Persist to storage
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      debugLog('ThemeProvider.setTheme: persisted ->', mode);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }, [themeMode, setColorScheme]);

  const theme = useMemo(() => ({
    mode: themeMode, // User preference: 'light' | 'dark'
    colorScheme: effectiveColorScheme, // Effective scheme from NativeWind: 'light' | 'dark'
    isDark, // Boolean convenience
    colors,
    setTheme: handleSetTheme,
  }), [themeMode, effectiveColorScheme, isDark, colors, handleSetTheme]);

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
