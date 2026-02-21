import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'parking_data';
const API_URL = 'https://gd.uni.wroc.pl/api/parking'; // Replace with actual endpoint
const FETCH_TIMEOUT = 15000;

// Helper to sanitize a group key so it complies with SecureStore rules (alphanumeric, ., -, _)
const sanitizeKey = (s) => String(s || '').replace(/[^a-zA-Z0-9._-]/g, '_');

const ParkingDataContext = createContext();

// debug logging utility used by provider and helpers
const debugLog = (...args) => {
  console.log('[ParkingData]', ...args);
};

export function useParkingData() {
  return useContext(ParkingDataContext);
}

export function ParkingDataProvider({ children }) {
  const [spaces, setSpaces] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(''); // 'api' or 'storage'


  // Fetch parking data with timeout
  const fetchParkingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSource('');
    debugLog('API fetch start');
      const start = Date.now();
    let timeoutId;
    let didTimeout = false;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = global.setTimeout(() => {
          didTimeout = true;
          reject(new Error('API fetch timeout'));
        }, FETCH_TIMEOUT);
      });
      const fetchPromise = fetch(API_URL)
        .then(res => res.json())
        .then(async (json) => {
          global.clearTimeout(timeoutId);
          debugLog('API fetch success', { url: API_URL, elapsedMs: Date.now() - start, preview: JSON.stringify(json).slice(0, 400) });
          // If API returns an array of parking groups, persist per-group; otherwise fall back to a single default key
          if (Array.isArray(json)) {
            for (const g of json) {
              const key = g.ParkingGroupName || g.Name || 'unknown';
              const val = g.CurrentFreeGroupCounterValue ?? g.spaces ?? null;
              const ts = g.Timestamp ?? new Date().toISOString();
              if (val !== null) {
                await storeParkingData(key, val, ts).catch((e) => debugLog('storeParkingData error', e));
              }
            }
          } else if (json && (json.spaces || json.timestamp)) {
            const key = json.ParkingGroupName || 'default';
            await storeParkingData(key, json.spaces ?? 0, json.timestamp ?? new Date().toISOString()).catch((e) => debugLog('storeParkingData error', e));
            setSpaces(json.spaces);
            setTimestamp(json.timestamp);
            setSource('api');
          } else {
            // unknown shape — store under 'default'
            await storeParkingData('default', json?.spaces ?? 0, new Date().toISOString()).catch((e) => debugLog('storeParkingData error', e));
          }
        });
      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      global.clearTimeout(timeoutId);
      debugLog('API fetch error', e);
      if (didTimeout) debugLog('API fetch timeout after', FETCH_TIMEOUT, 'ms');
      else debugLog('API fetch failed before timeout');
      // Fallback to storage: our helpers now return a map of entries.
      const storedMap = await readParkingData();
      if (storedMap && Object.keys(storedMap).length) {
        // prefer an entry named 'default' if present, otherwise take the first one
        const key = storedMap.default ? 'default' : Object.keys(storedMap)[0];
        const entry = storedMap[key];
        setSpaces(entry?.spaces);
        setTimestamp(entry?.timestamp);
        setSource('storage');
      } else {
        setError('No stored data available');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchParkingData();
  }, [fetchParkingData]);

  return (
    <ParkingDataContext.Provider value={{ spaces, timestamp, loading, error, source, fetchParkingData }}>
      {children}
    </ParkingDataContext.Provider>
  );
}

// Store parking data
// store a single parking group's data by key
// Store parking data for a single group independently under a composite key.
export const storeParkingData = async (groupKey, spaces, timestamp) => {
  try {
    // raw key for AsyncStorage (allows spaces/underscores)
    const rawKey = `${STORAGE_KEY}_${groupKey}`;
    const payload = JSON.stringify({ spaces, timestamp });
    await AsyncStorage.setItem(rawKey, payload);

    // sanitize only for SecureStore, which has stricter key rules
    try {
      const safeKey = `${STORAGE_KEY}_${sanitizeKey(groupKey)}`;
      await SecureStore.setItemAsync(safeKey, payload);
    } catch (e) {
      debugLog('SecureStore mirror failed', e?.message || e);
    }

    debugLog('Storage write', { key: rawKey, value: { spaces, timestamp } });
  } catch (e) {
    debugLog('Storage write error', e?.message || e);
  }
};

// Read parking data
// Read all stored parking entries and return a map { groupKey: { spaces, timestamp } }
export const readParkingData = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const prefix = `${STORAGE_KEY}_`;
    const groupKeys = (allKeys || []).filter((k) => k && k.startsWith(prefix));
    if (!groupKeys.length) return {};
    const entries = await AsyncStorage.multiGet(groupKeys);
    const map = {};
    for (const [fullKey, value] of entries) {
      try {
        const groupKey = fullKey.slice(prefix.length);
        map[groupKey] = JSON.parse(value);
      } catch (e) {
        debugLog('readParkingData: failed to parse entry', { key: fullKey, err: e?.message || e });
      }
    }
    debugLog('Storage read', { count: Object.keys(map).length });
    return map;
  } catch (e) {
    debugLog('Storage read error', e?.message || e);
    return {};
  }
};
