/**
 * Data transformation utilities for parking data
 * Extracted from ParkingDataManager.jsx - pure functions with no React/DOM dependencies
 */

import { parseTimestamp } from './dateUtils.js';

// Column name aliases for CSV parsing
export const COLUMN_ALIASES = {
  GD_TIME: 'gd_time',
  GD_VALUE: 'greenday free',
  UNI_TIME: 'uni_time',
  UNI_VALUE: 'uni free'
};

/**
 * Normalize a key string for case-insensitive comparison
 * @param {string} key - Key to normalize
 * @returns {string} Normalized key (lowercase, trimmed)
 */
export const normalizeKey = (key) => (key ? key.trim().toLowerCase() : '');

/**
 * Find a column key in a row object that matches the target alias
 * @param {Object} row - CSV row object
 * @param {string} target - Target column alias to find
 * @returns {string|null} Matching key or null if not found
 */
export const findColumnKey = (row, target) => {
  if (!row) return null;
  const targetKey = normalizeKey(target);
  return Object.keys(row).find((key) => normalizeKey(key) === targetKey) || null;
};

/**
 * Get a value from a row by column alias
 * @param {Object} row - CSV row object
 * @param {string} keyName - Column alias name
 * @returns {*} Value from row (trimmed if string) or undefined
 */
export const getRowValue = (row, keyName) => {
  const columnKey = findColumnKey(row, keyName);
  if (!columnKey) return undefined;
  const value = row[columnKey];
  return typeof value === 'string' ? value.trim() : value;
};

/**
 * Parse a timestamp string and return a Date object (uses dateUtils.parseTimestamp)
 * @param {string} raw - Raw timestamp string
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseTimestampValue = (raw) => {
  return parseTimestamp(raw);
};

/**
 * Build a data entry from a CSV row
 * @param {Object} row - CSV row object
 * @param {string} timeKey - Column alias for timestamp
 * @param {string} valueKey - Column alias for value
 * @returns {Object|null} Entry with {raw, date, value} or null if invalid
 */
export const buildEntryFromRow = (row, timeKey, valueKey) => {
  if (!row) return null;
  const raw = getRowValue(row, timeKey);
  const date = parseTimestampValue(raw);
  if (!date) return null;
  const valueRaw = getRowValue(row, valueKey);
  const valueNumber = valueRaw === undefined || valueRaw === null || valueRaw === '' ? null : Number(valueRaw);
  return {
    raw,
    date,
    value: Number.isNaN(valueNumber) ? null : valueNumber
  };
};

/**
 * Extract the last entry from an array of CSV rows
 * @param {Array} rows - Array of CSV row objects
 * @returns {Object} Object with {gd, uni} entries
 */
export const extractLastEntry = (rows) => {
  if (!rows || rows.length === 0) {
    return { gd: null, uni: null };
  }
  const lastRow = rows[rows.length - 1];
  return {
    gd: buildEntryFromRow(lastRow, COLUMN_ALIASES.GD_TIME, COLUMN_ALIASES.GD_VALUE),
    uni: buildEntryFromRow(lastRow, COLUMN_ALIASES.UNI_TIME, COLUMN_ALIASES.UNI_VALUE)
  };
};

/**
 * Remove duplicate rows from history data
 * @param {Array} rows - Array of CSV row objects
 * @returns {Array} Deduplicated rows
 */
export const dedupeHistoryRows = (rows = []) => {
  const seen = new Set();
  const result = [];
  rows.forEach((row) => {
    const gdKey = getRowValue(row, COLUMN_ALIASES.GD_TIME) || '';
    const uniKey = getRowValue(row, COLUMN_ALIASES.UNI_TIME) || '';
    const composite = `${gdKey}|||${uniKey}`;
    if (!seen.has(composite)) {
      seen.add(composite);
      result.push(row);
    }
  });
  return result;
};

/**
 * Parse an API response entry into a standardized format
 * @param {Object} record - API response object with Timestamp and CurrentFreeGroupCounterValue
 * @returns {Object|null} Entry with {raw, date, value} or null if invalid
 */
export const parseApiEntry = (record) => {
  if (!record || !record.Timestamp) return null;
  const raw = record.Timestamp.trim();
  if (!raw) return null;
  const iso = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const valueNumber = Number(record.CurrentFreeGroupCounterValue);
  return {
    raw,
    date,
    value: Number.isNaN(valueNumber) ? null : valueNumber
  };
};

/**
 * Clone API results array
 * @param {Array} apiResults - Array of API response objects
 * @returns {Array} Cloned array
 */
export const cloneApiResults = (apiResults = []) => (
  Array.isArray(apiResults) ? apiResults.map((result) => ({ ...(result || {}) })) : []
);

/**
 * Build a cache row from API payloads
 * @param {Object} gdPayload - GreenDay API payload
 * @param {Object} uniPayload - Uni API payload
 * @returns {Object} Cache row object
 */
export const buildCacheRowFromPayload = (gdPayload, uniPayload) => ({
  [COLUMN_ALIASES.GD_TIME]: gdPayload?.Timestamp || '',
  [COLUMN_ALIASES.GD_VALUE]: gdPayload?.CurrentFreeGroupCounterValue ?? '',
  [COLUMN_ALIASES.UNI_TIME]: uniPayload?.Timestamp || '',
  [COLUMN_ALIASES.UNI_VALUE]: uniPayload?.CurrentFreeGroupCounterValue ?? ''
});

/**
 * Slice a time-sorted array of {t: Date, v, raw} to the visible window
 * but always include the immediate connector points just outside the window
 * so line segments that cross the viewport boundaries stay connected.
 *
 * - If `startMs`/`endMs` are not provided, returns the original array.
 * - If there are points inside the window, include those plus one prior and one next if present.
 * - If there are no points inside the window, include the nearest prior and/or next points if present.
 *
 * @param {Array} arr - Sorted array of points {t: Date, v, raw}
 * @param {number|null} startMs - visible window start (ms)
 * @param {number|null} endMs - visible window end (ms)
 * @returns {Array} Subset array preserving ordering
 */
export const sliceWithConnectors = (arr = [], startMs, endMs) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (startMs == null || endMs == null) return arr.slice();

  // Find indices for points inside window
  let firstInside = -1;
  let lastInside = -1;
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i].t.getTime();
    if (t >= startMs && t <= endMs) {
      if (firstInside === -1) firstInside = i;
      lastInside = i;
    }
  }

  const result = [];
  if (firstInside !== -1) {
    // include one prior connector if available
    if (firstInside > 0) result.push(arr[firstInside - 1]);
    for (let i = firstInside; i <= lastInside; i++) result.push(arr[i]);
    // include one next connector if available
    if (lastInside < arr.length - 1) result.push(arr[lastInside + 1]);
    return result;
  }

  // No points inside window: include nearest prior and/or next
  let idxBefore = -1;
  let idxAfter = -1;
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i].t.getTime();
    if (t < startMs) idxBefore = i;
    if (t > endMs && idxAfter === -1) idxAfter = i;
  }

  if (idxBefore !== -1) result.push(arr[idxBefore]);
  if (idxAfter !== -1) result.push(arr[idxAfter]);
  return result;
};
