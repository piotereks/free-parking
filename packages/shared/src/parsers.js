/**
 * Core data parsing helpers for parking API and CSV data
 * Platform-agnostic functions for processing parking data
 */

import { COLUMN_ALIASES } from './config.js';

/**
 * Normalize string keys for case-insensitive comparison
 */
const normalizeKey = (key) => (key ? key.trim().toLowerCase() : '');

/**
 * Find a column key in a row object by target name (case-insensitive)
 */
const findColumnKey = (row, target) => {
  if (!row) return null;
  const targetKey = normalizeKey(target);
  return Object.keys(row).find((key) => normalizeKey(key) === targetKey) || null;
};

/**
 * Get a value from a CSV row by column alias
 */
const getRowValue = (row, keyName) => {
  const columnKey = findColumnKey(row, keyName);
  if (!columnKey) return undefined;
  const value = row[columnKey];
  return typeof value === 'string' ? value.trim() : value;
};

/**
 * Parse timestamp string to Date object
 * Handles both "YYYY-MM-DD HH:MM:SS" and ISO format
 */
export const parseTimestampValue = (raw) => {
  if (!raw) return null;
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Build a parking entry from a CSV row
 * @param {Object} row - CSV row object
 * @param {string} timeKey - Column alias for timestamp
 * @param {string} valueKey - Column alias for free spaces value
 * @returns {{raw: string, date: Date, value: number|null}|null}
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
 * Extract last GreenDay and Uni entries from CSV rows
 * @param {Array} rows - Parsed CSV rows
 * @returns {{gd: Object|null, uni: Object|null}}
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
 * Remove duplicate rows from history based on timestamp composite key
 * @param {Array} rows - CSV rows
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
 * Parse a parking API entry record
 * @param {Object} record - API response record
 * @returns {{raw: string, date: Date, value: number}|null}
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
