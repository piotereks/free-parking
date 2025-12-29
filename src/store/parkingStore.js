import { createParkingStore as createSharedStore } from '@piotereks/parking-shared';
import { webStorageAdapter } from '../adapters/webStorageAdapter';

// Create store with web adapters
export const useParkingStore = createSharedStore({
  storage: webStorageAdapter,
  logger: console
});

// Export refresh function that can be called from components
export const refreshParkingData = async () => {
    const refreshCallback = useParkingStore.getState().refreshCallback;
    if (refreshCallback) {
        await refreshCallback();
    } else {
        console.warn('Refresh callback not set yet');
    }
};

// Clear cache and stop auto-refresh
export const clearCache = async () => {
    try {
        // Use the shared clearCache action
        const clearCacheAction = useParkingStore.getState().clearCache;
        if (typeof clearCacheAction === 'function') {
            await clearCacheAction();
        }

        const stopCb = useParkingStore.getState().stopAutoRefresh;
        if (typeof stopCb === 'function') {
            try { stopCb(); } catch (e) { console.warn('stopAutoRefresh failed', e); }
        }

        console.log('Cache cleared and auto-refresh stopped');
    } catch (e) {
        console.error('clearCache failed', e);
    }
};

// Attach helper to window in dev for convenience
if (typeof window !== 'undefined') {
    window.clearCache = clearCache;
}
