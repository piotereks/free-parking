// Jest setup file for React Native environment
global.__DEV__ = true;

// Mock @babel/runtime helpers BEFORE any modules load
// These must return functions that properly handle the module object
jest.mock('@babel/runtime/helpers/interopRequireDefault', () => {
  return function interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  };
}, { virtual: true });

jest.mock('@babel/runtime/helpers/interopRequireWildcard', () => {
  return function interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    }
    const newObj = {};
    if (obj != null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    return newObj;
  };
}, { virtual: true });

// Mock NativeWind before it's loaded by any module
jest.mock('nativewind', () => ({
  styled: (Component) => Component,
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
