/**
 * Zustand store factory with adapter injection
 * Refactored from parkingStore.js to be framework-agnostic
 */

import { create } from 'zustand';
import { defaultLogger } from '../adapters/types.js';

/**
 * Create a parking data store with injected adapters
 * @param {Object} adapters - Platform-specific adapters
 * @param {StorageAdapter} adapters.storage - Storage adapter (localStorage/AsyncStorage)
 * @param {LoggerAdapter} adapters.logger - Logger adapter (default: console)
 * @returns {Object} Zustand store
 */
export const createParkingStore = (adapters = {}) => {
  const { storage, logger = defaultLogger } = adapters;

  return create((set, get) => ({
    // Real-time data state
    realtimeData: [],
    realtimeLoading: true,
    realtimeError: null,
    lastRealtimeUpdate: null,

    // Historical data state
    historyData: [],
    historyLoading: false,
    lastHistoryUpdate: null,

    // Fetch in progress flag
    fetchInProgress: false,

    // Refresh callback (set by data manager)
    refreshCallback: null,
    // Stop auto-refresh callback (set by data manager)
    stopAutoRefresh: null,
    // Cache-cleared flag to prevent further automatic fetches
    cacheCleared: false,

    // Actions
    setRealtimeData: (data) => set({ realtimeData: data }),
    setRealtimeLoading: (loading) => set({ realtimeLoading: loading }),
    setRealtimeError: (error) => set({ realtimeError: error }),
    setLastRealtimeUpdate: (timestamp) => set({ lastRealtimeUpdate: timestamp }),

    setHistoryData: (data) => set({ historyData: data }),
    setHistoryLoading: (loading) => set({ historyLoading: loading }),
    setLastHistoryUpdate: (timestamp) => set({ lastHistoryUpdate: timestamp }),

    setFetchInProgress: (inProgress) => set({ fetchInProgress: inProgress }),

    setRefreshCallback: (callback) => set({ refreshCallback: callback }),
    setStopAutoRefresh: (cb) => set({ stopAutoRefresh: cb }),
    setCacheCleared: (v) => set({ cacheCleared: v }),

    // Convenience action to update all realtime fields at once
    updateRealtimeState: (updates) => set(updates),

    // Convenience action to update all history fields at once
    updateHistoryState: (updates) => set(updates),

    // Clear cache using injected storage adapter
    clearCache: async () => {
      try {
        if (storage) {
          await storage.remove('parking_realtime_cache');
          await storage.remove('parking_history_cache');
        }

        // Mark store as cache-cleared and stop future automatic fetches
        set({ fetchInProgress: false, cacheCleared: true });

        const stopCb = get().stopAutoRefresh;
        if (typeof stopCb === 'function') {
          try {
            stopCb();
          } catch (e) {
            logger.warn('stopAutoRefresh failed', e);
          }
        }

        logger.log('Cache cleared and auto-refresh stopped');
      } catch (e) {
        logger.error('clearCache failed', e);
      }
    },

    // Reset store (useful for testing)
    resetStore: () => set({
      realtimeData: [],
      realtimeLoading: true,
      realtimeError: null,
      lastRealtimeUpdate: null,
      historyData: [],
      historyLoading: false,
      lastHistoryUpdate: null,
      fetchInProgress: false,
      refreshCallback: null,
      stopAutoRefresh: null,
      cacheCleared: false
    })
  }));
};

/**
 * Create refresh helper function for a store instance
 * @param {Object} store - Zustand store instance
 * @returns {Function} Async refresh function
 */
export const createRefreshHelper = (store) => {
  return async () => {
    const refreshCallback = store.getState().refreshCallback;
    if (refreshCallback) {
      await refreshCallback();
    } else {
      console.warn('Refresh callback not set yet');
    }
  };
};
