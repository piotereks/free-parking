import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParkingDataProvider, useParkingData, storeParkingData, readParkingData } from '../src/context/ParkingDataPersistence';
import { fetchAndStoreEntry } from '../src/context/ParkingEntryManager';

jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

// some tests use fake timers and long waits; bump default timeout
jest.setTimeout(15000);

describe('ParkingDataPersistence helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // provide simple in-memory AsyncStorage behavior for read/write tests
    const mem = {};
    AsyncStorage.setItem.mockImplementation((k, v) => {
      mem[k] = v;
      return Promise.resolve();
    });
    AsyncStorage.getAllKeys.mockImplementation(() => Promise.resolve(Object.keys(mem)));
    AsyncStorage.multiGet.mockImplementation(() => Promise.resolve(Object.entries(mem)));
    // SecureStore no-op by default
    SecureStore.setItemAsync.mockResolvedValue();
  });

  it('writes and reads data via both stores (per-group)', async () => {
    // simulate existing storage
    AsyncStorage.getAllKeys.mockResolvedValueOnce(['parking_data_GroupA']);
    AsyncStorage.multiGet.mockResolvedValueOnce([
      ['parking_data_GroupA', JSON.stringify({ spaces: 1, timestamp: 't1' })],
    ]);

    const data = await readParkingData();
    expect(data).toEqual({ GroupA: { spaces: 1, timestamp: 't1' } });

    // now write a new group and verify AsyncStorage & SecureStore keys
    await storeParkingData('Group B', 5, 'now');
    const expectedKey = 'parking_data_Group B';
    const expectedPayload = JSON.stringify({ spaces: 5, timestamp: 'now' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(expectedKey, expectedPayload);
    const sanitize = (s) => String(s || '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const secureKey = `parking_data_${sanitize('Group B')}`;
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(secureKey, expectedPayload);
  });

  it('preserves group names with spaces on read/write', async () => {
    await storeParkingData('Green Day', 7, 't1');
    const map = await readParkingData();
    console.log('TEST map', map);
    expect(map['Green Day']).toEqual({ spaces: 7, timestamp: 't1' });
  });

  it('fetchAndStoreEntry logs prior stored entry and falls back when fetch errors', async () => {
    // prepare a stored entry
    AsyncStorage.getAllKeys.mockResolvedValue(['parking_data_X']);
    AsyncStorage.multiGet.mockResolvedValue([['parking_data_X', JSON.stringify({ spaces: 3, timestamp: 'old' })]]);
    // fetch function that rejects immediately
    const failFetch = () => Promise.reject(new Error('network'));
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    console.debug.mockClear();

    const result = await fetchAndStoreEntry('X', failFetch);
    expect(result).toEqual({ spaces: 3, timestamp: 'old', source: 'storage' });
    expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'fetchAndStoreEntry: prior stored entry', 'X', { spaces: 3, timestamp: 'old' });
    console.debug.mockClear();
    AsyncStorage.getAllKeys.mockResolvedValue([]);
    AsyncStorage.multiGet.mockResolvedValue([]);
    await fetchAndStoreEntry('Y', () => Promise.reject(new Error('meh')));
    expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'fetchAndStoreEntry: prior stored entry', 'Y', null);
  });

  it('fetchAndStoreEntry logs prior stored entry and falls back when fetch errors', async () => {
    // prepare a stored entry
    AsyncStorage.getAllKeys.mockResolvedValue(['parking_data_X']);
    AsyncStorage.multiGet.mockResolvedValue([['parking_data_X', JSON.stringify({ spaces: 3, timestamp: 'old' })]]);
    // fetch function that rejects immediately
    const failFetch = () => Promise.reject(new Error('network')); 
    // intercept debug logs so we can assert
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    // reset call history in case previous tests logged
    console.debug.mockClear();

    const result = await fetchAndStoreEntry('X', failFetch);

    expect(result).toEqual({ spaces: 3, timestamp: 'old', source: 'storage' });
    expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'fetchAndStoreEntry: prior stored entry', 'X', { spaces: 3, timestamp: 'old' });
    // also verify null is logged when key isn't present
    console.debug.mockClear();
    AsyncStorage.getAllKeys.mockResolvedValue([]);
    AsyncStorage.multiGet.mockResolvedValue([]);
    await fetchAndStoreEntry('Y', () => Promise.reject(new Error('meh')));
    expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'fetchAndStoreEntry: prior stored entry', 'Y', null);
  });});

// simple consumer for provider tests
function Consumer({ onUpdate }) {
  const { spaces, timestamp, source, fetchParkingData } = useParkingData();
  React.useEffect(() => { onUpdate({ spaces, timestamp, source }); }, [spaces, timestamp, source]);
  React.useEffect(() => { fetchParkingData(); }, [fetchParkingData]);
  return null;
}

describe('ParkingDataProvider behavior', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks && fetch.resetMocks();
  });

  it.skip('fetch success updates state and stores result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ spaces: 7, timestamp: 'ts' }),
    });
    SecureStore.setItemAsync.mockResolvedValue();
    AsyncStorage.setItem.mockResolvedValue();
    SecureStore.getItemAsync.mockResolvedValue(null);
    AsyncStorage.getItem.mockResolvedValue(null);

    let last;
    await act(async () => {
      render(
        <ParkingDataProvider>
          <Consumer onUpdate={(v) => (last = v)} />
        </ParkingDataProvider>
      );
    });

    await waitFor(() => expect(last?.spaces).toBe(7));
    expect(last.source).toBe('api');
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  it('timeout triggers storage fallback', async () => {
    // never resolve fetch
    global.fetch = jest.fn(() => new Promise(() => {}));
    // simulate stored entry via AsyncStorage
    AsyncStorage.getAllKeys.mockResolvedValue(['parking_data_default']);
    AsyncStorage.multiGet.mockResolvedValue([['parking_data_default', JSON.stringify({ spaces: 9, timestamp: 'old' })]]);
    SecureStore.getItemAsync.mockResolvedValue(null);

    jest.useFakeTimers();
    let last;
    render(
      <ParkingDataProvider>
        <Consumer onUpdate={(v) => (last = v)} />
      </ParkingDataProvider>
    );

    await act(async () => {
      jest.advanceTimersByTime(15000);
    });

    expect(last.source).toBe('storage');
    expect(last.spaces).toBe(9);
    jest.useRealTimers();
  });
});
