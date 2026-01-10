import { create } from 'zustand';

export const useParkingStore = create((set) => ({
    // Real-time data state
    realtimeData: [],
    realtimeLoading: true,
    realtimeError: null,
    lastRealtimeUpdate: null,

    // Actions
    setRealtimeData: (data) => set({ realtimeData: data }),
    setRealtimeLoading: (loading) => set({ realtimeLoading: loading }),
    setRealtimeError: (error) => set({ realtimeError: error }),
    setLastRealtimeUpdate: (timestamp) => set({ lastRealtimeUpdate: timestamp }),

    // Convenience action to update all realtime fields at once
    updateRealtimeState: (updates) => set(updates),
}));
