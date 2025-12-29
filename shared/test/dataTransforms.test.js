import { describe, it, expect } from 'vitest';
import {
  normalizeKey,
  findColumnKey,
  getRowValue,
  parseTimestampValue,
  buildEntryFromRow,
  extractLastEntry,
  dedupeHistoryRows,
  parseApiEntry,
  cloneApiResults,
  buildCacheRowFromPayload,
  COLUMN_ALIASES
} from '../src/dataTransforms.js';

describe('dataTransforms', () => {
  describe('normalizeKey', () => {
    it('lowercases and trims strings', () => {
      expect(normalizeKey('  HELLO  ')).toBe('hello');
      expect(normalizeKey('Test Key')).toBe('test key');
    });

    it('handles empty string', () => {
      expect(normalizeKey('')).toBe('');
    });

    it('handles null', () => {
      expect(normalizeKey(null)).toBe('');
    });

    it('handles undefined', () => {
      expect(normalizeKey(undefined)).toBe('');
    });
  });

  describe('findColumnKey', () => {
    const testRow = {
      'GD_Time': 'value1',
      'Greenday Free': 'value2',
      'UNI_TIME': 'value3'
    };

    it('finds key case-insensitively', () => {
      expect(findColumnKey(testRow, 'gd_time')).toBe('GD_Time');
      expect(findColumnKey(testRow, 'greenday free')).toBe('Greenday Free');
    });

    it('returns null for non-existent key', () => {
      expect(findColumnKey(testRow, 'nonexistent')).toBeNull();
    });

    it('returns null for null row', () => {
      expect(findColumnKey(null, 'key')).toBeNull();
    });
  });

  describe('getRowValue', () => {
    const testRow = {
      'GD_Time': '  2024-01-15 14:30:00  ',
      'Greenday Free': '100',
      'Number': 42
    };

    it('retrieves and trims string values', () => {
      expect(getRowValue(testRow, 'gd_time')).toBe('2024-01-15 14:30:00');
    });

    it('retrieves non-string values as-is', () => {
      expect(getRowValue(testRow, 'number')).toBe(42);
    });

    it('returns undefined for non-existent key', () => {
      expect(getRowValue(testRow, 'nonexistent')).toBeUndefined();
    });
  });

  describe('parseTimestampValue', () => {
    it('parses valid timestamp', () => {
      const result = parseTimestampValue('2024-01-15 14:30:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('returns null for empty string', () => {
      expect(parseTimestampValue('')).toBeNull();
    });

    it('returns null for invalid timestamp', () => {
      expect(parseTimestampValue('invalid')).toBeNull();
    });
  });

  describe('buildEntryFromRow', () => {
    const testRow = {
      'GD_Time': '2024-01-15 14:30:00',
      'Greenday Free': '100'
    };

    it('builds entry from valid row', () => {
      const entry = buildEntryFromRow(testRow, COLUMN_ALIASES.GD_TIME, COLUMN_ALIASES.GD_VALUE);
      expect(entry).toBeTruthy();
      expect(entry?.raw).toBe('2024-01-15 14:30:00');
      expect(entry?.date).toBeInstanceOf(Date);
      expect(entry?.value).toBe(100);
    });

    it('returns null for null row', () => {
      expect(buildEntryFromRow(null, 'key1', 'key2')).toBeNull();
    });

    it('returns null when timestamp is invalid', () => {
      const invalidRow = { 'GD_Time': 'invalid', 'Greenday Free': '100' };
      expect(buildEntryFromRow(invalidRow, COLUMN_ALIASES.GD_TIME, COLUMN_ALIASES.GD_VALUE)).toBeNull();
    });

    it('handles empty value as null', () => {
      const emptyValueRow = { 'GD_Time': '2024-01-15 14:30:00', 'Greenday Free': '' };
      const entry = buildEntryFromRow(emptyValueRow, COLUMN_ALIASES.GD_TIME, COLUMN_ALIASES.GD_VALUE);
      expect(entry?.value).toBeNull();
    });
  });

  describe('extractLastEntry', () => {
    it('extracts last entry from rows', () => {
      const rows = [
        { 'gd_time': '2024-01-15 14:00:00', 'greenday free': '80', 'uni_time': '2024-01-15 14:00:00', 'uni free': '20' },
        { 'gd_time': '2024-01-15 15:00:00', 'greenday free': '100', 'uni_time': '2024-01-15 15:00:00', 'uni free': '30' }
      ];
      const result = extractLastEntry(rows);
      expect(result.gd?.value).toBe(100);
      expect(result.uni?.value).toBe(30);
    });

    it('returns null entries for empty array', () => {
      const result = extractLastEntry([]);
      expect(result.gd).toBeNull();
      expect(result.uni).toBeNull();
    });

    it('returns null entries for null input', () => {
      const result = extractLastEntry(null);
      expect(result.gd).toBeNull();
      expect(result.uni).toBeNull();
    });
  });

  describe('dedupeHistoryRows', () => {
    it('removes duplicate rows', () => {
      const rows = [
        { 'gd_time': '2024-01-15 14:00:00', 'uni_time': '2024-01-15 14:00:00' },
        { 'gd_time': '2024-01-15 14:00:00', 'uni_time': '2024-01-15 14:00:00' },
        { 'gd_time': '2024-01-15 15:00:00', 'uni_time': '2024-01-15 15:00:00' }
      ];
      const result = dedupeHistoryRows(rows);
      expect(result).toHaveLength(2);
    });

    it('handles empty array', () => {
      expect(dedupeHistoryRows([])).toEqual([]);
    });

    it('handles undefined', () => {
      expect(dedupeHistoryRows(undefined)).toEqual([]);
    });
  });

  describe('parseApiEntry', () => {
    it('parses valid API entry', () => {
      const record = {
        Timestamp: '2024-01-15 14:30:00',
        CurrentFreeGroupCounterValue: 100
      };
      const result = parseApiEntry(record);
      expect(result?.raw).toBe('2024-01-15 14:30:00');
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.value).toBe(100);
    });

    it('returns null for null record', () => {
      expect(parseApiEntry(null)).toBeNull();
    });

    it('returns null for record without Timestamp', () => {
      expect(parseApiEntry({ CurrentFreeGroupCounterValue: 100 })).toBeNull();
    });

    it('returns null for invalid timestamp', () => {
      const record = {
        Timestamp: 'invalid',
        CurrentFreeGroupCounterValue: 100
      };
      expect(parseApiEntry(record)).toBeNull();
    });
  });

  describe('cloneApiResults', () => {
    it('clones array of objects', () => {
      const original = [
        { Timestamp: '2024-01-15 14:00:00', CurrentFreeGroupCounterValue: 100 },
        { Timestamp: '2024-01-15 15:00:00', CurrentFreeGroupCounterValue: 120 }
      ];
      const cloned = cloneApiResults(original);
      expect(cloned).toHaveLength(2);
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
    });

    it('returns empty array for undefined', () => {
      expect(cloneApiResults(undefined)).toEqual([]);
    });

    it('returns empty array for null', () => {
      expect(cloneApiResults(null)).toEqual([]);
    });
  });

  describe('buildCacheRowFromPayload', () => {
    it('builds cache row from payloads', () => {
      const gdPayload = {
        Timestamp: '2024-01-15 14:00:00',
        CurrentFreeGroupCounterValue: 100
      };
      const uniPayload = {
        Timestamp: '2024-01-15 14:00:00',
        CurrentFreeGroupCounterValue: 30
      };
      const row = buildCacheRowFromPayload(gdPayload, uniPayload);
      expect(row[COLUMN_ALIASES.GD_TIME]).toBe('2024-01-15 14:00:00');
      expect(row[COLUMN_ALIASES.GD_VALUE]).toBe(100);
      expect(row[COLUMN_ALIASES.UNI_TIME]).toBe('2024-01-15 14:00:00');
      expect(row[COLUMN_ALIASES.UNI_VALUE]).toBe(30);
    });

    it('handles null payloads', () => {
      const row = buildCacheRowFromPayload(null, null);
      expect(row[COLUMN_ALIASES.GD_TIME]).toBe('');
      expect(row[COLUMN_ALIASES.GD_VALUE]).toBe('');
    });
  });
});
