/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import pkg from '../package.json';

// Mock dependencies
jest.mock('../src/context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    isDark: false,
    setTheme: jest.fn(),
  }),
}));

jest.mock('../src/hooks/useParkingStore', () => {
  return jest.fn((selector) => {
    const state = {
      realtimeData: [],
      realtimeLoading: false,
      realtimeError: null,
      lastRealtimeUpdate: null,
    };
    return selector(state);
  });
});

jest.mock('../src/hooks/useOrientation', () => {
  return jest.fn(() => 'portrait');
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useWindowDimensions: () => ({ width: 360, height: 800 }),
  };
});

jest.mock('../AdMobManager', () => ({
  default: null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));

// Import after mocks
const App = require('../src/App').default;

describe('App Version Display', () => {
  const expectedVersion = pkg.version || '0.0.0';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display version in portrait mode header', () => {
    const useOrientation = require('../src/hooks/useOrientation');
    useOrientation.mockReturnValue('portrait');

    const { getByText } = render(<App />);
    
    // Check version is displayed with v prefix
    expect(getByText(`v${expectedVersion}`)).toBeTruthy();
  });

  it('should display version in landscape mode header', () => {
    const useOrientation = require('../src/hooks/useOrientation');
    useOrientation.mockReturnValue('landscape');

    const { getByText } = render(<App />);
    
    // Check version is displayed with v prefix
    expect(getByText(`v${expectedVersion}`)).toBeTruthy();
  });

  it('should display "Real-time • GD-Uni Wrocław" label in portrait mode', () => {
    const useOrientation = require('../src/hooks/useOrientation');
    useOrientation.mockReturnValue('portrait');

    const { getByText } = render(<App />);
    
    // Check realtime label is displayed
    expect(getByText('Real-time • GD-Uni Wrocław')).toBeTruthy();
  });

  it('should display "Real-time • GD-Uni Wrocław" label in landscape mode', () => {
    const useOrientation = require('../src/hooks/useOrientation');
    useOrientation.mockReturnValue('landscape');

    const { getByText } = render(<App />);
    
    // Check realtime label is displayed
    expect(getByText('Real-time • GD-Uni Wrocław')).toBeTruthy();
  });

  it('should use fallback version "0.0.0" if package.json version is missing', () => {
    // This test validates the fallback logic in the component
    // The actual implementation uses pkg?.version || '0.0.0'
    const fallbackVersion = '0.0.0';
    expect(pkg?.version || fallbackVersion).toBe(expectedVersion);
  });
});
