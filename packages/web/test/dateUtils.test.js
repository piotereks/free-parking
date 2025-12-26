import { describe, it, expect } from 'vitest';
import {
  parseTimestamp,
  getAgeInMinutes,
  formatTime,
  isStaleTimestamp
} from '@free-parking/shared';

describe('dateUtils', () => {
  describe('parseTimestamp', () => {
    it('parses timestamp with space separator', () => {
      const result = parseTimestamp('2024-01-15 14:30:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(15);
      expect(result?.getHours()).toBe(14);
      expect(result?.getMinutes()).toBe(30);
    });

    it('parses timestamp with T separator', () => {
      const result = parseTimestamp('2024-01-15T14:30:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0);
    });

    it('returns null for empty string', () => {
      expect(parseTimestamp('')).toBeNull();
    });

    it('returns null for null input', () => {
      expect(parseTimestamp(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(parseTimestamp(undefined)).toBeNull();
    });

    it('returns null for invalid timestamp', () => {
      expect(parseTimestamp('invalid-date')).toBeNull();
    });

    it('handles ISO 8601 format', () => {
      const result = parseTimestamp('2024-01-15T14:30:00Z');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('getAgeInMinutes', () => {
    it('calculates age in minutes correctly', () => {
      const from = new Date('2024-01-15T14:00:00');
      const to = new Date('2024-01-15T14:05:00');
      expect(getAgeInMinutes(from, to)).toBe(5);
    });

    it('calculates age for exact hour', () => {
      const from = new Date('2024-01-15T14:00:00');
      const to = new Date('2024-01-15T15:00:00');
      expect(getAgeInMinutes(from, to)).toBe(60);
    });

    it('returns 0 for same timestamp', () => {
      const date = new Date('2024-01-15T14:00:00');
      expect(getAgeInMinutes(date, date)).toBe(0);
    });

    it('returns 0 for negative age (future date)', () => {
      const from = new Date('2024-01-15T15:00:00');
      const to = new Date('2024-01-15T14:00:00');
      expect(getAgeInMinutes(from, to)).toBe(0);
    });

    it('returns 0 for null from date', () => {
      expect(getAgeInMinutes(null, new Date())).toBe(0);
    });

    it('returns 0 for null to date', () => {
      expect(getAgeInMinutes(new Date(), null)).toBe(0);
    });

    it('uses current time when to is not provided', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const age = getAgeInMinutes(fiveMinutesAgo);
      expect(age).toBeGreaterThanOrEqual(4);
      expect(age).toBeLessThanOrEqual(6);
    });

    it('floors fractional minutes', () => {
      const from = new Date('2024-01-15T14:00:00');
      const to = new Date('2024-01-15T14:05:30');
      expect(getAgeInMinutes(from, to)).toBe(5);
    });
  });

  describe('formatTime', () => {
    it('formats Date object to locale time string', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = formatTime(date, 'pl-PL');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('formats timestamp string to locale time string', () => {
      const result = formatTime('2024-01-15 14:30:45', 'pl-PL');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('returns placeholder for null timestamp', () => {
      expect(formatTime(null)).toBe('--:--:--');
    });

    it('returns placeholder for undefined timestamp', () => {
      expect(formatTime(undefined)).toBe('--:--:--');
    });

    it('returns placeholder for invalid timestamp string', () => {
      expect(formatTime('invalid-date')).toBe('--:--:--');
    });

    it('uses default locale when not specified', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('uses custom locale when specified', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = formatTime(date, 'en-US');
      expect(result).toBeTruthy();
      expect(result).not.toBe('--:--:--');
    });
  });

  describe('isStaleTimestamp', () => {
    it('returns true for timestamp older than default threshold (15 min)', () => {
      const oldDate = new Date(Date.now() - 20 * 60 * 1000);
      expect(isStaleTimestamp(oldDate)).toBe(true);
    });

    it('returns false for timestamp within default threshold', () => {
      const recentDate = new Date(Date.now() - 10 * 60 * 1000);
      expect(isStaleTimestamp(recentDate)).toBe(false);
    });

    it('returns false for very recent timestamp', () => {
      const recentDate = new Date(Date.now() - 1 * 60 * 1000);
      expect(isStaleTimestamp(recentDate)).toBe(false);
    });

    it('uses custom threshold when provided', () => {
      const date = new Date(Date.now() - 10 * 60 * 1000);
      expect(isStaleTimestamp(date, 5)).toBe(true);
      expect(isStaleTimestamp(date, 15)).toBe(false);
    });

    it('returns true for null timestamp', () => {
      expect(isStaleTimestamp(null)).toBe(true);
    });

    it('returns true for undefined timestamp', () => {
      expect(isStaleTimestamp(undefined)).toBe(true);
    });

    it('returns false for exact threshold boundary', () => {
      const date = new Date(Date.now() - 15 * 60 * 1000);
      expect(isStaleTimestamp(date, 15)).toBe(true);
    });

    it('returns false for just under threshold', () => {
      const date = new Date(Date.now() - 14 * 60 * 1000);
      expect(isStaleTimestamp(date, 15)).toBe(false);
    });
  });
});
