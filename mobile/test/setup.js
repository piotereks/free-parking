// Jest setup file for React Native environment
global.__DEV__ = true;

// Ensure react and react-native are properly available before any test runs
require('react');
require('react-native');

// Mock NativeWind before it's loaded by any module
jest.mock('nativewind', () => ({
  styled: (Component) => Component,
  NativeWindStyleSheet: { create: () => ({}) },
}));

// Mock React Native Appearance API
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  removeChangeListener: jest.fn(),
}));

// Mock console methods for cleaner test output (optional)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };
