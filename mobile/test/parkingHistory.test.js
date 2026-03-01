// Use the manual mock in __mocks__/@react-native-async-storage/async-storage.js
jest.mock('@react-native-async-storage/async-storage');

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addHistoryEntry, readHistory, pruneOldEntries } from '../src/utils/parkingHistory';

describe('parkingHistory utility', () => {
  let store;

  beforeEach(() => {
    jest.resetAllMocks();
    store = {};
    AsyncStorage.getItem.mockImplementation((k) => Promise.resolve(store[k] ?? null));
    AsyncStorage.setItem.mockImplementation((k, v) => { store[k] = v; return Promise.resolve(); });
  });

  it('pruneOldEntries removes entries older than 48h', () => {
    const now = new Date('2026-01-03T12:00:00Z');
    const entries = [
      { timestamp: '2026-01-01T11:59:00Z', gd: 10, uni: 5, total: 15 }, // >48h old → removed
      { timestamp: '2026-01-01T12:01:00Z', gd: 20, uni: 8, total: 28 }, // just under 48h → kept
      { timestamp: '2026-01-03T11:00:00Z', gd: 30, uni: 3, total: 33 }, // recent → kept
    ];
    const result = pruneOldEntries(entries, now);
    expect(result).toHaveLength(2);
    expect(result[0].gd).toBe(20);
    expect(result[1].gd).toBe(30);
  });

  it('addHistoryEntry and readHistory round-trip', async () => {
    const realtimeData = [
      { ParkingGroupName: 'GreenDay', CurrentFreeGroupCounterValue: 120 },
      { ParkingGroupName: 'Bank_1', CurrentFreeGroupCounterValue: 30 },
    ];
    await addHistoryEntry(realtimeData);
    const history = await readHistory();
    expect(history).toHaveLength(1);
    const entry = history[0];
    expect(entry.gd).toBe(120);
    expect(entry.uni).toBe(30);
    expect(entry.total).toBe(150);
    expect(typeof entry.timestamp).toBe('string');
  });

  it('addHistoryEntry accumulates multiple entries', async () => {
    const batch1 = [{ ParkingGroupName: 'GreenDay', CurrentFreeGroupCounterValue: 100 }];
    const batch2 = [{ ParkingGroupName: 'GreenDay', CurrentFreeGroupCounterValue: 80 }];
    await addHistoryEntry(batch1);
    await addHistoryEntry(batch2);
    const history = await readHistory();
    expect(history).toHaveLength(2);
  });

  it('addHistoryEntry is a no-op for empty data', async () => {
    await addHistoryEntry([]);
    const history = await readHistory();
    expect(history).toHaveLength(0);
  });

  it('readHistory returns empty array when nothing stored', async () => {
    const history = await readHistory();
    expect(history).toEqual([]);
  });
});
