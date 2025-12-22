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
