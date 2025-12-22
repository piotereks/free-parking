import { create } from 'zustand';

// Store reference for calling actions outside of React components
let storeRef = null;

export const useParkingStore = create((set, get) => {
    const store = {
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

        // Refresh callback (set by ParkingDataProvider)
        refreshCallback: null,
        // Stop auto-refresh callback (set by ParkingDataProvider)
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

        // Reset store for testing
        resetStore: () => set({
            realtimeData: [],
            realtimeLoading: true,
            realtimeError: null,
            lastRealtimeUpdate: null,
            historyData: [],
            historyLoading: false,
            lastHistoryUpdate: null,
            fetchInProgress: false,
            refreshCallback: null
        })
    };
    
    storeRef = store;
    return store;
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

// Clear local caches and stop auto-refresh. Safe to call from console.
export const clearCache = () => {
    try {
        // Remove known cache keys
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('parking_realtime_cache');
            localStorage.removeItem('parking_history_cache');
        }

        // Mark store as cache-cleared and stop future automatic fetches.
        // Do NOT wipe in-memory data so the UI remains visible.
        useParkingStore.setState({
            fetchInProgress: false,
            cacheCleared: true
        });

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
