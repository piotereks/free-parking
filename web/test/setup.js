import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { useParkingStore } from '../src/store/parkingStore';

expect.extend(matchers);

afterEach(() => {
  cleanup();

  try {
    if (useParkingStore && typeof useParkingStore.getState === 'function') {
      const state = useParkingStore.getState();
      if (typeof state.resetStore === 'function') state.resetStore();
    }
  } catch {
    // ignore if store not available in environment
  }

  try { localStorage.clear(); } catch { /* ignore */ }
  try { document.body.className = ''; } catch { /* ignore */ }
});
