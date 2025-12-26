import { describe, it, expect, beforeEach } from 'vitest';
import { useParkingStore, refreshParkingData, clearCache } from '@free-parking/shared';

describe('parkingStore', () => {
  beforeEach(() => {
    useParkingStore.getState().resetStore();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('initializes with correct default state', () => {
      const state = useParkingStore.getState();
      
      expect(state.realtimeData).toEqual([]);
      expect(state.realtimeLoading).toBe(true);
      expect(state.realtimeError).toBeNull();
      expect(state.historyData).toEqual([]);
      expect(state.historyLoading).toBe(false);
      expect(state.fetchInProgress).toBe(false);
      expect(state.cacheCleared).toBe(false);
    });
  });

  describe('realtime data management', () => {
    it('updates realtime data correctly', () => {
      const testData = [
        { ParkingGroupName: 'Test', CurrentFreeGroupCounterValue: 10, Timestamp: '2024-01-01 12:00:00' }
      ];
      
      useParkingStore.getState().setRealtimeData(testData);
      
      expect(useParkingStore.getState().realtimeData).toEqual(testData);
    });

    it('sets realtime error', () => {
      const error = 'Network error';
      useParkingStore.getState().setRealtimeError(error);
      expect(useParkingStore.getState().realtimeError).toBe(error);
    });

    it('sets last realtime update timestamp', () => {
      const timestamp = new Date();
      useParkingStore.getState().setLastRealtimeUpdate(timestamp);
      expect(useParkingStore.getState().lastRealtimeUpdate).toBe(timestamp);
    });

    it('updates realtime state in batch', () => {
      const testData = [{ ParkingGroupName: 'Test', CurrentFreeGroupCounterValue: 5 }];
      const timestamp = new Date();
      
      useParkingStore.getState().updateRealtimeState({
        realtimeData: testData,
        realtimeLoading: false,
        lastRealtimeUpdate: timestamp
      });

      const state = useParkingStore.getState();
      expect(state.realtimeData).toEqual(testData);
      expect(state.realtimeLoading).toBe(false);
      expect(state.lastRealtimeUpdate).toBe(timestamp);
    });
  });

  describe('loading states', () => {
    it('updates loading states correctly', () => {
      useParkingStore.getState().setRealtimeLoading(false);
      expect(useParkingStore.getState().realtimeLoading).toBe(false);
      
      useParkingStore.getState().setHistoryLoading(true);
      expect(useParkingStore.getState().historyLoading).toBe(true);
    });

    it('sets fetch in progress flag', () => {
      useParkingStore.getState().setFetchInProgress(true);
      expect(useParkingStore.getState().fetchInProgress).toBe(true);

      useParkingStore.getState().setFetchInProgress(false);
      expect(useParkingStore.getState().fetchInProgress).toBe(false);
    });
  });

  describe('history data management', () => {
    it('sets history data', () => {
      const historyData = [
        { date: '2024-01-01', value: 10 },
        { date: '2024-01-02', value: 15 }
      ];
      
      useParkingStore.getState().setHistoryData(historyData);
      expect(useParkingStore.getState().historyData).toEqual(historyData);
    });

    it('sets last history update timestamp', () => {
      const timestamp = new Date();
      useParkingStore.getState().setLastHistoryUpdate(timestamp);
      expect(useParkingStore.getState().lastHistoryUpdate).toBe(timestamp);
    });

    it('updates history state in batch', () => {
      const historyData = [{ date: '2024-01-01', value: 10 }];
      const timestamp = new Date();
      
      useParkingStore.getState().updateHistoryState({
        historyData,
        historyLoading: false,
        lastHistoryUpdate: timestamp
      });

      const state = useParkingStore.getState();
      expect(state.historyData).toEqual(historyData);
      expect(state.historyLoading).toBe(false);
      expect(state.lastHistoryUpdate).toBe(timestamp);
    });
  });

  describe('callbacks', () => {
    it('sets refresh callback', () => {
      const mockCallback = () => console.log('refresh');
      useParkingStore.getState().setRefreshCallback(mockCallback);
      expect(useParkingStore.getState().refreshCallback).toBe(mockCallback);
    });

    it('sets stop auto-refresh callback', () => {
      const mockCallback = () => console.log('stop');
      useParkingStore.getState().setStopAutoRefresh(mockCallback);
      expect(useParkingStore.getState().stopAutoRefresh).toBe(mockCallback);
    });
  });

  describe('refreshParkingData', () => {
    it('calls refresh callback when set', async () => {
      let called = false;
      const mockRefresh = async () => { called = true; };
      
      useParkingStore.getState().setRefreshCallback(mockRefresh);
      await refreshParkingData();
      
      expect(called).toBe(true);
    });

    it('handles missing refresh callback gracefully', async () => {
      useParkingStore.getState().setRefreshCallback(null);
      await expect(refreshParkingData()).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('removes cache keys from localStorage', () => {
      localStorage.setItem('parking_realtime_cache', 'data1');
      localStorage.setItem('parking_history_cache', 'data2');
      
      clearCache();
      
      expect(localStorage.getItem('parking_realtime_cache')).toBeNull();
      expect(localStorage.getItem('parking_history_cache')).toBeNull();
    });

    it('sets cacheCleared flag', () => {
      clearCache();
      expect(useParkingStore.getState().cacheCleared).toBe(true);
    });

    it('resets fetchInProgress flag', () => {
      useParkingStore.getState().setFetchInProgress(true);
      clearCache();
      expect(useParkingStore.getState().fetchInProgress).toBe(false);
    });

    it('calls stop auto-refresh callback if set', () => {
      let called = false;
      const mockStop = () => { called = true; };
      
      useParkingStore.getState().setStopAutoRefresh(mockStop);
      clearCache();
      
      expect(called).toBe(true);
    });

    it('does not throw if stop callback is not set', () => {
      expect(() => clearCache()).not.toThrow();
    });

    it('preserves in-memory data', () => {
      const testData = [{ ParkingGroupName: 'Test', CurrentFreeGroupCounterValue: 10 }];
      useParkingStore.getState().setRealtimeData(testData);
      
      clearCache();
      
      expect(useParkingStore.getState().realtimeData).toEqual(testData);
    });
  });

  describe('resetStore', () => {
    it('resets all state to defaults', () => {
      const testData = [{ ParkingGroupName: 'Test', CurrentFreeGroupCounterValue: 10 }];
      useParkingStore.getState().setRealtimeData(testData);
      useParkingStore.getState().setRealtimeLoading(false);
      useParkingStore.getState().setRealtimeError('error');
      useParkingStore.getState().setHistoryData([{ date: '2024-01-01' }]);
      
      useParkingStore.getState().resetStore();
      
      const state = useParkingStore.getState();
      expect(state.realtimeData).toEqual([]);
      expect(state.realtimeLoading).toBe(true);
      expect(state.realtimeError).toBeNull();
      expect(state.historyData).toEqual([]);
      expect(state.historyLoading).toBe(false);
      expect(state.fetchInProgress).toBe(false);
    });
  });

  describe('cache cleared flag', () => {
    it('sets cache cleared flag', () => {
      useParkingStore.getState().setCacheCleared(true);
      expect(useParkingStore.getState().cacheCleared).toBe(true);
      
      useParkingStore.getState().setCacheCleared(false);
      expect(useParkingStore.getState().cacheCleared).toBe(false);
    });
  });
});
