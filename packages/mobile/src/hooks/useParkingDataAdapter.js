import { useEffect, useRef, useState } from 'react';
import { useParkingStore } from '@free-parking/shared';
import { storageMobile } from '../adapters/storageMobile';

/**
 * Custom hook to initialize parking data layer with mobile storage adapter
 * Ensures the shared Zustand store uses AsyncStorage instead of localStorage
 * 
 * Usage in a component:
 *   const { isInitialized, error } = useParkingDataAdapter();
 * 
 * @returns {Object} { isInitialized: boolean, error: Error|null }
 */
export function useParkingDataAdapter() {
  const isInitializedRef = useRef(false);
  const hasInitialized = useParkingStore((state) => state.cacheCleared !== undefined);

  useEffect(() => {
    const initializeAdapter = async () => {
      // Prevent multiple initializations
      if (isInitializedRef.current) {
        return;
      }
      isInitializedRef.current = true;

      try {
        // Load cached parking data from AsyncStorage on app startup
        // This ensures data persists across app restarts
        const cachedRealtimeData = await storageMobile.getItem('parking_realtime_cache');
        const cachedHistoryData = await storageMobile.getItem('parking_history_cache');

        if (cachedRealtimeData) {
          try {
            const parsed = JSON.parse(cachedRealtimeData);
            // Data will be loaded by ParkingDataManager or Dashboard on mount
            console.log('Realtime cache found on startup');
          } catch (error) {
            console.error('Failed to parse realtime cache on startup:', error);
          }
        }

        if (cachedHistoryData) {
          try {
            const parsed = JSON.parse(cachedHistoryData);
            // Data will be loaded by ParkingDataManager or Statistics on mount
            console.log('History cache found on startup');
          } catch (error) {
            console.error('Failed to parse history cache on startup:', error);
          }
        }

        console.log('Parking data adapter initialized with mobile storage');
      } catch (error) {
        console.error('Error initializing parking data adapter:', error);
        throw error;
      }
    };

    initializeAdapter();
  }, [hasInitialized]);

  return {
    isInitialized: hasInitialized,
    storageAdapter: storageMobile,
  };
}

/**
 * Hook to clear all parking data and stop auto-refresh
 * Wrapper around shared clearCache() for convenience
 * 
 * Usage in a component:
 *   const handleClearData = useClearParkingData();
 *   // Later:
 *   await handleClearData();
 * 
 * @returns {Function} Async function to clear cache
 */
export function useClearParkingData() {
  const { clearCache } = require('@free-parking/shared');

  return async () => {
    try {
      // Clear from AsyncStorage
      await storageMobile.clear();
      // Clear from Zustand store
      await clearCache();
      console.log('Parking data cleared');
    } catch (error) {
      console.error('Error clearing parking data:', error);
      throw error;
    }
  };
}

/**
 * Hook to manually refresh parking data
 * 
 * Usage in a component:
 *   const { refresh, isLoading, error } = useRefreshParkingData();
 *   // Later:
 *   await refresh();
 * 
 * @returns {Object} { refresh: Function, isLoading: boolean, error: Error|null }
 */
export function useRefreshParkingData() {
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const refreshParkingData = useParkingStore((state) => state.refreshParkingData);

  const refresh = async () => {
    try {
      await refreshParkingData();
    } catch (error) {
      console.error('Error refreshing parking data:', error);
      throw error;
    }
  };

  return {
    refresh,
    isLoading: realtimeLoading,
    error: realtimeError,
  };
}

/**
 * Hook to get current parking data age
 * Updates every minute
 * 
 * Usage in a component:
 *   const { ageMinutes, ageLabel } = useParkingDataAge();
 * 
 * @returns {Object} { ageMinutes: number, ageLabel: string }
 */
export function useParkingDataAge() {
  const { calculateDataAge, formatAgeLabel } = require('@free-parking/shared');
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);

  const [dataAge, setDataAge] = useState(0);

  useEffect(() => {
    if (!lastRealtimeUpdate) {
      setDataAge(0);
      return;
    }

    const updateAge = () => {
      const age = calculateDataAge(lastRealtimeUpdate, new Date());
      setDataAge(age);
    };

    // Update immediately
    updateAge();

    // Update every minute
    const timer = setInterval(updateAge, 60000);

    return () => clearInterval(timer);
  }, [lastRealtimeUpdate]);

  return {
    ageMinutes: dataAge,
    ageLabel: formatAgeLabel(dataAge),
  };
}
