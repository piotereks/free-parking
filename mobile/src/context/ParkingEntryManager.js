import { readParkingData, storeParkingData } from './ParkingDataPersistence';
import { debugLog } from '../config/debug';

const FETCH_TIMEOUT = 15000;

export async function readEntry(key) {
  const map = await readParkingData();
  return map[key] || null;
}

export async function writeEntry(key, spaces, timestamp) {
  await storeParkingData(key, spaces, timestamp);
}

// fetchFn: async function that returns either the parking group object or {spaces,timestamp}
export async function fetchAndStoreEntry(key, fetchFn) {
  const start = Date.now();
  let timeoutId;
  let didTimeout = false;

  // read existing entry and log before attempting network
  try {
    const prior = await readParkingData();
    // always log attempt, even if nothing found
    const entry = prior ? prior[key] : undefined;
    debugLog('fetchAndStoreEntry: prior stored entry', key, entry || null);
  } catch (e) {
    debugLog('fetchAndStoreEntry: prior read failed', key, e?.message || e);
  }

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = global.setTimeout(() => {
        didTimeout = true;
        reject(new Error('fetch timeout'));
      }, FETCH_TIMEOUT);
    });

    const res = await Promise.race([fetchFn(), timeoutPromise]);
    global.clearTimeout(timeoutId);

    // normalize result to spaces + timestamp
    const spaces = res?.CurrentFreeGroupCounterValue ?? res?.spaces ?? null;
    const timestamp = res?.Timestamp ?? res?.timestamp ?? new Date().toISOString();

    if (spaces !== null) {
      await storeParkingData(key, spaces, timestamp);
      // elapsedMs is an instrumentation metric and not persisted
      debugLog('Entry persisted (api)', { key, spaces, timestamp, elapsedMs: Date.now() - start });
      return { spaces, timestamp, source: 'api', elapsedMs: Date.now() - start };
    }

    // unknown shape: store raw under key if possible
    debugLog('fetchAndStoreEntry: unknown shape, storing fallback', { key, preview: JSON.stringify(res).slice(0,200) });
    await storeParkingData(key, 0, timestamp);
    return { spaces: 0, timestamp, source: 'api', elapsedMs: Date.now() - start };
  } catch (e) {
    global.clearTimeout(timeoutId);
    debugLog('fetchAndStoreEntry: fetch error', { key, err: e?.message || e, didTimeout });
    // fallback to storage
    const map = await readParkingData();
    const stored = map[key];
    if (stored) {
      debugLog('fetchAndStoreEntry: using stored', { key, stored });
      return { spaces: stored.spaces, timestamp: stored.timestamp, source: 'storage' };
    }
    return null;
  }
}
