import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Appearance } from 'react-native';

// Use official AsyncStorage mock to match module shape
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

const mockGetItem = AsyncStorage.getItem;
const mockSetItem = AsyncStorage.setItem;

describe('ThemeContext', () => {
  let appearanceListeners = [];

  beforeEach(() => {
    appearanceListeners = [];
    
    // Reset and reconfigure mocks
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockGetItem.mockImplementation(() => Promise.resolve(null));
    mockSetItem.mockImplementation(() => Promise.resolve());

    // Mock Appearance API
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    jest.spyOn(Appearance, 'addChangeListener').mockImplementation((callback) => {
      appearanceListeners.push(callback);
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within ThemeProvider');
    
    spy.mockRestore();
  });

  it('should initialize with auto mode and light color scheme', async () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.mode).toBe('auto');
      expect(result.current.colorScheme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });
  });

  it('should initialize with dark color scheme when system is dark', async () => {
    Appearance.getColorScheme.mockReturnValue('dark');

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });
  });

  it('should load saved theme preference from AsyncStorage', async () => {
    mockGetItem.mockImplementation(() => Promise.resolve('dark'));

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.mode).toBe('dark');
      expect(mockGetItem).toHaveBeenCalledWith('parking_theme');
    });
  });

  it('should set theme mode and persist to AsyncStorage', async () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(result.current.mode).toBe('dark');
      expect(mockSetItem).toHaveBeenCalledWith('parking_theme', 'dark');
    });
  });

  it('should ignore invalid theme mode', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.setTheme('invalid');
    });

    expect(result.current.mode).toBe('auto');
    expect(spy).toHaveBeenCalledWith('Invalid theme mode:', 'invalid');
    expect(mockSetItem).not.toHaveBeenCalled();
    
    spy.mockRestore();
  });

  it('should react to system color scheme changes when in auto mode', async () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('light');
    });

    // Simulate system theme change
    act(() => {
      appearanceListeners.forEach((listener) => listener({ colorScheme: 'dark' }));
    });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });
  });

  it('should not react to system changes when theme is manually set', async () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Set theme to light manually
    await act(async () => {
      await result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(result.current.mode).toBe('light');
      expect(result.current.colorScheme).toBe('light');
    });

    // Simulate system theme change to dark
    act(() => {
      appearanceListeners.forEach((listener) => listener({ colorScheme: 'dark' }));
    });

    // Should remain light (not auto)
    await waitFor(() => {
      expect(result.current.colorScheme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });
  });

  it('should provide correct color palette for light mode', async () => {
    Appearance.getColorScheme.mockReturnValue('light');

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colors.background).toBe('#fff');
      expect(result.current.colors.text).toBe('#000');
      expect(result.current.colors.border).toBe('#eee');
    });
  });

  it('should provide correct color palette for dark mode', async () => {
    Appearance.getColorScheme.mockReturnValue('dark');

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colors.background).toBe('#000');
      expect(result.current.colors.text).toBe('#fff');
      expect(result.current.colors.border).toBe('#333');
    });
  });

  it('should handle AsyncStorage errors gracefully when loading', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetItem.mockImplementation(() => Promise.reject(new Error('Storage error')));

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.mode).toBe('auto');
      expect(spy).toHaveBeenCalledWith(
        'Failed to load theme preference:',
        expect.any(Error)
      );
    });

    spy.mockRestore();
  });

  it('should handle AsyncStorage errors gracefully when saving', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSetItem.mockImplementation(() => Promise.reject(new Error('Storage error')));

    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        'Failed to save theme preference:',
        expect.any(Error)
      );
    });

    spy.mockRestore();
  });
});
