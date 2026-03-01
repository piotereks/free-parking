import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'parking_history_v1';
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Add a new history entry from the latest realtime data.
 * @param {Array} realtimeData - Array of parking group objects from the API
 */
export async function addHistoryEntry(realtimeData) {
  if (!Array.isArray(realtimeData) || realtimeData.length === 0) return;

  try {
    const now = new Date();
    const entry = { timestamp: now.toISOString(), gd: null, uni: null, total: 0 };

    for (const item of realtimeData) {
      const name = (item.ParkingGroupName || '').toLowerCase();
      const value = item.CurrentFreeGroupCounterValue ?? 0;
      if (name.includes('green') || name.startsWith('gd') || name.includes('zaparkuj')) {
        entry.gd = value;
      } else if (name.includes('bank') || name.includes('uni')) {
        entry.uni = value;
      }
      entry.total += value;
    }

    const existing = await readHistory();
    const pruned = pruneOldEntries(existing, now);
    pruned.push(entry);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(pruned));
  } catch (e) {
    console.warn('[parkingHistory] addHistoryEntry error:', e?.message || e);
  }
}

/**
 * Read all stored history entries.
 * @returns {Promise<Array>} array of { timestamp, gd, uni, total }
 */
export async function readHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[parkingHistory] readHistory error:', e?.message || e);
    return [];
  }
}

/**
 * Remove entries older than MAX_AGE_MS relative to `now`.
 * @param {Array} entries
 * @param {Date} now
 * @returns {Array}
 */
export function pruneOldEntries(entries, now = new Date()) {
  const cutoff = now.getTime() - MAX_AGE_MS;
  return entries.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return !isNaN(t) && t >= cutoff;
  });
}
