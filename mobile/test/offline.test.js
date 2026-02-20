import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

let _rehydrated = { realtime: null, history: null };

jest.mock('../shared/src/index.js', () => ({
  createParkingStore: (adapters) => {
    // trigger hydration calls to adapters.storage so tests can observe
    setImmediate(() => {
      adapters.storage.get('parking_realtime_cache').then((v) => {
        _rehydrated.realtime = v;
      });
      adapters.storage.get('parking_history_cache').then((v) => {
        _rehydrated.history = v;
      });
    });

    const useStore = () => ({});
    useStore._getRehydrated = () => _rehydrated;
    return useStore;
  },
}));

import { useParkingStore } from '../src/hooks/useParkingStore';

describe('offline hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adapters.storage.get is called for cache keys and values parsed', async () => {
    const realtimeCache = { items: [{ id: 'p1', free: 10 }] };
    const historyCache = [{ ts: '2025-12-31T12:00:00', v: 5 }];

    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'parking_realtime_cache') return Promise.resolve(JSON.stringify(realtimeCache));
      if (key === 'parking_history_cache') return Promise.resolve(JSON.stringify(historyCache));
      return Promise.resolve(null);
    });

    // Importing/useParkingStore triggers createParkingStore mock which calls adapters.storage.get
    const hook = useParkingStore;

    // wait a tick for the mocked promises to resolve
    await new Promise((r) => setImmediate(r));

    const rehydrated = hook._getRehydrated();
    expect(rehydrated.realtime).toEqual(realtimeCache);
    expect(rehydrated.history).toEqual(historyCache);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('parking_realtime_cache');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('parking_history_cache');
  });
});
