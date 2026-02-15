import '@testing-library/jest-native/extend-expect';

// Basic React Native test setup shims
// load NativeAnimatedHelper via dynamic ESM import to keep this file ESM-only
try {
  const mod = await import('react-native/Libraries/Animated/NativeAnimatedHelper').catch(() => null);
  const NativeAnimatedHelper = mod?.default ?? mod;
  if (NativeAnimatedHelper) {
    // no-op - used to silence RN animated warnings in tests
  }
} catch (e) {
  // ignore if not available in test environment
}
