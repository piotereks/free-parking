import '@testing-library/jest-native/extend-expect';

// Basic React Native test setup shims
try {
  // Silence native animated helper warnings if present
  // eslint-disable-next-line global-require
  const NativeAnimatedHelper = require('react-native/Libraries/Animated/NativeAnimatedHelper');
  if (NativeAnimatedHelper) {
    // no-op
  }
} catch (e) {
  // ignore if not available in test environment
}
