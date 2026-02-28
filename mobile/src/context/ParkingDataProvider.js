import React, { useCallback, useEffect, useRef } from 'react';
import { useParkingStore } from '../hooks/useParkingStore';
import { createMobileFetchAdapter } from '../adapters/mobileFetchAdapter';
import { debugLog } from '../config/debug';
import { fetchAndStoreEntry } from './ParkingEntryManager';
import { readParkingData } from './ParkingDataPersistence';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwLNDbg8KjlVHsZWj9JUnO_OBIyZaRgZ4gZ8_Gbyly2J3f6rlCW6lDHAihwbuLhxWbBkNMI1wdWRAq/pub?gid=411529798&single=true&output=csv';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const fields = [];
      let inQuote = false;
      let current = '';
      for (const ch of line) {
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { fields.push(current); current = ''; }
        else { current += ch; }
      }
      fields.push(current);
      const row = {};
      headers.forEach((h, i) => { row[h] = (fields[i] || '').trim(); });
      return row;
    });
}

const FETCH_TIMEOUT = 15000;

// Helper to run a fetch operation with a timeout and detailed logs
const fetchWithTimeout = async (label, fn) => {
  const start = Date.now();
  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = global.setTimeout(() => reject(new Error('fetch timeout')), FETCH_TIMEOUT);
    });
    const res = await Promise.race([fn(), timeoutPromise]);
    global.clearTimeout(timeoutId);
    debugLog('fetchWithTimeout success', { label, elapsedMs: Date.now() - start, preview: JSON.stringify(res).slice(0, 400) });
    return res;
  } catch (e) {
    global.clearTimeout(timeoutId);
    debugLog('fetchWithTimeout error', { label, message: e?.message || e });
    throw e;
  }
};

const API_URLS = [
  'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
  'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json',
];

const fetchAdapter = createMobileFetchAdapter();

/**
 * Data provider for mobile: fetches realtime data and history CSV, wires refresh callback.
 */
const ParkingDataProvider = ({ children }) => {
  const setRealtimeData = useParkingStore((s) => s.setRealtimeData);
  const setRealtimeLoading = useParkingStore((s) => s.setRealtimeLoading);
  const setRealtimeError = useParkingStore((s) => s.setRealtimeError);
  const setLastRealtimeUpdate = useParkingStore((s) => s.setLastRealtimeUpdate);
  const setHistoryData = useParkingStore((s) => s.setHistoryData);
  const setHistoryLoading = useParkingStore((s) => s.setHistoryLoading);
  const setRefreshCallback = useParkingStore((s) => s.setRefreshCallback);
  const setStopAutoRefresh = useParkingStore((s) => s.setStopAutoRefresh);
  const cacheCleared = useParkingStore((s) => s.cacheCleared);

  const fetchInFlight = useRef(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const csvText = await fetchWithTimeout('history-csv', () => fetchAdapter.fetchText(CSV_URL));
      const rows = parseCSV(csvText);
      debugLog('fetchHistory: parsed rows', rows.length);
      setHistoryData(rows);
    } catch (e) {
      debugLog('fetchHistory: error', e?.message || e);
    } finally {
      setHistoryLoading(false);
    }
  }, [setHistoryData, setHistoryLoading]);

  const fetchRealtime = useCallback(async () => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    setRealtimeLoading(true);
    setRealtimeError(null);
    // read existing storage before hitting network, helpful for debugging/fallback
    try {
      const before = await readParkingData();
      debugLog('fetchRealtime: prefetch storage snapshot', Object.keys(before || {}).length);
    } catch (e) {
      debugLog('fetchRealtime: prefetch storage read failed', e?.message || e);
    }
    // Mark the time we started a fetch so UI shows an immediate "last update" timestamp
    try {
      setLastRealtimeUpdate(new Date());
      debugLog('fetchRealtime: set lastRealtimeUpdate at start');
    } catch (e) {
      // ignore errors setting the timestamp
    }
    try {
      debugLog('fetchRealtime: starting network fetch');
      const results = await Promise.all(
        API_URLS.map((url) => fetchWithTimeout(url, () => fetchAdapter.fetchJSON(url)))
      );
      // Keep only truthy responses
      const cleaned = Array.isArray(results)
        ? results.filter((item) => !!item)
        : [];
      setRealtimeData(cleaned);
      debugLog('fetchRealtime: network data received', cleaned.length, 'items');

      // For each group returned by APIs, call per-entry manager to persist independently
      (async () => {
        for (const group of cleaned) {
          const key = group.ParkingGroupName || group.Name || 'unknown';
          // call fetchAndStoreEntry with a fetchFn that resolves to this group's object
          fetchAndStoreEntry(key, async () => group).catch((e) => debugLog('per-entry persist error', { key, e }));
        }
      })();
      // per-entry persistence is handled by fetchAndStoreEntry above; do not persist aggregated totals here

      setLastRealtimeUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch realtime data:', err);
      setRealtimeError(err);
      // on timeout/network failure try to read stored total and present fallback
      try {
        const storedMap = await readParkingData();
        if (storedMap) {
          // Prefer an explicit 'total' entry if present, otherwise sum available stored entries
          const totalEntry = storedMap.total;
          if (totalEntry) {
            debugLog('fetchRealtime: using stored total fallback', totalEntry);
            setRealtimeData([{ ParkingGroupName: 'Stored', CurrentFreeGroupCounterValue: totalEntry.spaces }]);
            setLastRealtimeUpdate(new Date(totalEntry.timestamp));
          } else {
            // sum all stored entries' spaces
            const vals = Object.values(storedMap || {});
            const sum = vals.reduce((acc, it) => acc + (it?.spaces || 0), 0);
            const latestTs = vals.reduce((acc, it) => {
              if (!it?.timestamp) return acc;
              const t = new Date(it.timestamp);
              return !acc || t > acc ? t : acc;
            }, null);
            debugLog('fetchRealtime: using summed stored fallback', { sum, latestTs });
            setRealtimeData([{ ParkingGroupName: 'Stored', CurrentFreeGroupCounterValue: sum }]);
            if (latestTs) setLastRealtimeUpdate(latestTs);
          }
        }
      } catch (e) {
        debugLog('fetchRealtime: storage fallback read failed', e);
      }
    } finally {
      fetchInFlight.current = false;
      setRealtimeLoading(false);
    }
  }, [setLastRealtimeUpdate, setRealtimeData, setRealtimeError, setRealtimeLoading]);

  useEffect(() => {
    // Register the actual fetchRealtime function so callers invoke it directly
    setRefreshCallback(fetchRealtime);

    // Initial fetch and auto-refresh every 5 minutes (match web behavior)
    if (cacheCleared) {
      debugLog('ParkingDataProvider: cache cleared — skipping initial fetch and auto-refresh');
      return () => {
        setRefreshCallback(null);
        setStopAutoRefresh(null);
      };
    }

    fetchRealtime();
    fetchHistory();
    const refreshTimer = global.setInterval(fetchRealtime, 5 * 60 * 1000);

    try {
      setStopAutoRefresh(() => () => global.clearInterval(refreshTimer));
    } catch (e) {
      debugLog('ParkingDataProvider: failed to register stopAutoRefresh', e?.message || e);
    }

    return () => {
      global.clearInterval(refreshTimer);
      setRefreshCallback(null);
      setStopAutoRefresh(null);
    };
  }, [fetchRealtime, fetchHistory, setRefreshCallback, setStopAutoRefresh, cacheCleared]);

  return children;
};

export default ParkingDataProvider;
