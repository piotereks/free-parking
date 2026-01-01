jest.mock('parking-shared', () => ({
  createParkingStore: (adapters) => {
    const state = { realtimeData: [], historyData: [], lastUpdate: null };
    const clearCache = jest.fn();
    const resetStore = jest.fn();
    const useStore = () => state;
    useStore.clearCache = clearCache;
    useStore.resetStore = resetStore;
    useStore.getState = () => state;
    return useStore;
  },
}));

import { useParkingStore } from '../src/hooks/useParkingStore';

describe('useParkingStore wiring', () => {
  test('store hook returns expected shape and methods are available', () => {
    const store = useParkingStore();
    expect(store).toHaveProperty('realtimeData');
    expect(store).toHaveProperty('historyData');
    expect(typeof useParkingStore.clearCache).toBe('function');
    expect(typeof useParkingStore.resetStore).toBe('function');

    useParkingStore.clearCache();
    expect(useParkingStore.clearCache).toHaveBeenCalled();
  });
});
