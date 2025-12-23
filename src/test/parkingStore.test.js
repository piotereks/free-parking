import { describe, it, expect } from 'vitest';
import { useParkingStore } from '../store/parkingStore';

describe('parkingStore', () => {
  it('initializes with correct default state', () => {
    const state = useParkingStore.getState();
    
    expect(state.realtimeData).toEqual([]);
    expect(state.realtimeLoading).toBe(true);
    expect(state.realtimeError).toBeNull();
    expect(state.historyData).toEqual([]);
    expect(state.historyLoading).toBe(false);
  });

  it('updates realtime data correctly', () => {
    const testData = [
      { ParkingGroupName: 'Test', CurrentFreeGroupCounterValue: 10, Timestamp: '2024-01-01 12:00:00' }
    ];
    
    useParkingStore.getState().setRealtimeData(testData);
    
    expect(useParkingStore.getState().realtimeData).toEqual(testData);
  });

  it('updates loading states correctly', () => {
    useParkingStore.getState().setRealtimeLoading(false);
    expect(useParkingStore.getState().realtimeLoading).toBe(false);
    
    useParkingStore.getState().setHistoryLoading(true);
    expect(useParkingStore.getState().historyLoading).toBe(true);
  });
});
