import { describe, it, expect } from 'vitest';
import {
  normalizeParkingName,
  getAgeClass,
  calculateTotalSpaces,
  isValidParkingData,
  calculateDataAge,
  getMaxCapacity,
  calculateApproximation,
  applyApproximations,
  PARKING_MAX_CAPACITY,
  formatAgeLabel
} from '../src/parkingUtils.js';

describe('parkingUtils', () => {
  describe('normalizeParkingName', () => {
    it('converts Bank_1 to Uni Wroc', () => {
      expect(normalizeParkingName('Bank_1')).toBe('Uni Wroc');
    });

    it('returns other names unchanged', () => {
      expect(normalizeParkingName('GreenDay')).toBe('GreenDay');
      expect(normalizeParkingName('Central Parking')).toBe('Central Parking');
    });

    it('returns Unknown for empty string', () => {
      expect(normalizeParkingName('')).toBe('Unknown');
    });

    it('returns Unknown for null', () => {
      expect(normalizeParkingName(null)).toBe('Unknown');
    });

    it('returns Unknown for undefined', () => {
      expect(normalizeParkingName(undefined)).toBe('Unknown');
    });

    it('preserves case for non-Bank_1 names', () => {
      expect(normalizeParkingName('TEST')).toBe('TEST');
      expect(normalizeParkingName('test')).toBe('test');
    });
  });

  describe('getAgeClass', () => {
    it('returns empty string for fresh data (< 5 min)', () => {
      expect(getAgeClass(0)).toBe('');
      expect(getAgeClass(1)).toBe('');
      expect(getAgeClass(4)).toBe('');
    });

    it('returns age-medium for data 5-15 min old', () => {
      expect(getAgeClass(6)).toBe('age-medium');
      expect(getAgeClass(10)).toBe('age-medium');
      expect(getAgeClass(14)).toBe('age-medium');
    });

    it('returns age-old for data >= 15 min old', () => {
      expect(getAgeClass(15)).toBe('age-old');
      expect(getAgeClass(20)).toBe('age-old');
      expect(getAgeClass(100)).toBe('age-old');
    });

    it('handles boundary cases correctly', () => {
      expect(getAgeClass(5)).toBe('');
      expect(getAgeClass(5.1)).toBe('age-medium');
    });
  });

  describe('calculateTotalSpaces', () => {
    it('calculates total from multiple parking entries', () => {
      const data = [
        { CurrentFreeGroupCounterValue: 10 },
        { CurrentFreeGroupCounterValue: 20 },
        { CurrentFreeGroupCounterValue: 30 }
      ];
      expect(calculateTotalSpaces(data)).toBe(60);
    });

    it('handles zero values', () => {
      const data = [
        { CurrentFreeGroupCounterValue: 0 },
        { CurrentFreeGroupCounterValue: 10 }
      ];
      expect(calculateTotalSpaces(data)).toBe(10);
    });

    it('returns 0 for empty array', () => {
      expect(calculateTotalSpaces([])).toBe(0);
    });

    it('returns 0 for null input', () => {
      expect(calculateTotalSpaces(null)).toBe(0);
    });

    it('returns 0 for undefined input', () => {
      expect(calculateTotalSpaces(undefined)).toBe(0);
    });

    it('treats missing CurrentFreeGroupCounterValue as 0', () => {
      const data = [
        { CurrentFreeGroupCounterValue: 10 },
        { someOtherField: 'value' },
        { CurrentFreeGroupCounterValue: 5 }
      ];
      expect(calculateTotalSpaces(data)).toBe(15);
    });

    it('handles single parking entry', () => {
      const data = [{ CurrentFreeGroupCounterValue: 42 }];
      expect(calculateTotalSpaces(data)).toBe(42);
    });

    it('handles large numbers', () => {
      const data = [
        { CurrentFreeGroupCounterValue: 1000 },
        { CurrentFreeGroupCounterValue: 2000 }
      ];
      expect(calculateTotalSpaces(data)).toBe(3000);
    });
  });

  describe('isValidParkingData', () => {
    it('returns true for valid parking data', () => {
      const data = {
        ParkingGroupName: 'Test Parking',
        Timestamp: '2024-01-15 14:30:00',
        CurrentFreeGroupCounterValue: 10
      };
      expect(isValidParkingData(data)).toBe(true);
    });

    it('returns false for missing ParkingGroupName', () => {
      const data = {
        Timestamp: '2024-01-15 14:30:00',
        CurrentFreeGroupCounterValue: 10
      };
      expect(isValidParkingData(data)).toBe(false);
    });

    it('returns false for missing Timestamp', () => {
      const data = {
        ParkingGroupName: 'Test Parking',
        CurrentFreeGroupCounterValue: 10
      };
      expect(isValidParkingData(data)).toBe(false);
    });

    it('returns false for missing CurrentFreeGroupCounterValue', () => {
      const data = {
        ParkingGroupName: 'Test Parking',
        Timestamp: '2024-01-15 14:30:00'
      };
      expect(isValidParkingData(data)).toBe(false);
    });

    it('returns false for null input', () => {
      expect(isValidParkingData(null)).toBe(false);
    });

    it('returns false for undefined input', () => {
      expect(isValidParkingData(undefined)).toBe(false);
    });

    it('returns false for non-object input', () => {
      expect(isValidParkingData('string')).toBe(false);
      expect(isValidParkingData(123)).toBe(false);
    });
  });

  describe('calculateDataAge', () => {
    it('calculates age in minutes', () => {
      const now = new Date('2024-01-15T15:00:00');
      const timestamp = '2024-01-15 14:55:00';
      expect(calculateDataAge(timestamp, now)).toBe(5);
    });

    it('returns Infinity for empty timestamp', () => {
      expect(calculateDataAge('', new Date())).toBe(Infinity);
    });

    it('returns Infinity for null timestamp', () => {
      expect(calculateDataAge(null, new Date())).toBe(Infinity);
    });

    it('handles T separator in timestamp', () => {
      const now = new Date('2024-01-15T15:00:00');
      const timestamp = '2024-01-15T14:30:00';
      expect(calculateDataAge(timestamp, now)).toBe(30);
    });
  });

  describe('formatAgeLabel', () => {
    it('formats minutes correctly', () => {
      expect(formatAgeLabel(0)).toEqual({
        display: '0 min ago',
        aria: 'Data from 0 minutes ago'
      });
      expect(formatAgeLabel(1)).toEqual({
        display: '1 min ago',
        aria: 'Data from 1 minute ago'
      });
      expect(formatAgeLabel(30)).toEqual({
        display: '30 min ago',
        aria: 'Data from 30 minutes ago'
      });
    });

    it('formats hours correctly', () => {
      expect(formatAgeLabel(60)).toEqual({
        display: '1 h ago',
        aria: 'Data from 1 hour ago'
      });
      expect(formatAgeLabel(120)).toEqual({
        display: '2 h ago',
        aria: 'Data from 2 hours ago'
      });
    });

    it('formats days correctly', () => {
      expect(formatAgeLabel(1440)).toEqual({
        display: '1 d ago',
        aria: 'Data from 1 day ago'
      });
      expect(formatAgeLabel(2160)).toEqual({
        display: '1.5 d ago',
        aria: 'Data from 1.5 days ago'
      });
    });

    it('handles non-finite values', () => {
      expect(formatAgeLabel(Infinity)).toEqual({
        display: '--',
        aria: 'Data age unavailable'
      });
    });
  });

  describe('getMaxCapacity', () => {
    it('returns capacity for known parking names', () => {
      expect(getMaxCapacity('Green Day')).toBe(187);
      expect(getMaxCapacity('Uni Wroc')).toBe(41);
    });

    it('returns capacity for Bank_1', () => {
      expect(getMaxCapacity('Bank_1')).toBe(41);
    });

    it('returns undefined for unknown parking', () => {
      expect(getMaxCapacity('Unknown Parking')).toBeUndefined();
    });
  });

  describe('calculateApproximation', () => {
    it('does not approximate fresh data', () => {
      const now = new Date('2024-01-15T15:00:00');
      const staleData = {
        ParkingGroupName: 'Green Day',
        Timestamp: '2024-01-15 14:50:00',
        CurrentFreeGroupCounterValue: 100
      };
      const freshData = {
        ParkingGroupName: 'Uni Wroc',
        Timestamp: '2024-01-15 14:59:00',
        CurrentFreeGroupCounterValue: 20
      };
      
      const result = calculateApproximation(staleData, freshData, now);
      expect(result.isApproximated).toBe(false);
      expect(result.approximated).toBe(100);
    });

    it('approximates stale data based on fresh data ratio', () => {
      const now = new Date('2024-01-15T15:00:00');
      const staleData = {
        ParkingGroupName: 'Green Day',
        Timestamp: '2024-01-15 14:00:00',
        CurrentFreeGroupCounterValue: 100
      };
      const freshData = {
        ParkingGroupName: 'Uni Wroc',
        Timestamp: '2024-01-15 14:59:00',
        CurrentFreeGroupCounterValue: 20
      };
      
      const result = calculateApproximation(staleData, freshData, now);
      expect(result.isApproximated).toBe(true);
      // Uni has 20/41 free, so Green Day should have ~(20/41)*187 = ~91
      expect(result.approximated).toBeCloseTo(91, 0);
    });
  });

  describe('applyApproximations', () => {
    it('returns empty array for empty input', () => {
      expect(applyApproximations([])).toEqual([]);
    });

    it('adds approximation metadata to non-2-area data', () => {
      const data = [{
        ParkingGroupName: 'Test',
        Timestamp: '2024-01-15 14:00:00',
        CurrentFreeGroupCounterValue: 50
      }];
      const result = applyApproximations(data);
      expect(result[0].approximationInfo).toBeDefined();
      expect(result[0].approximationInfo.isApproximated).toBe(false);
    });

    it('applies approximations to 2-area data when needed', () => {
      const now = new Date('2024-01-15T15:00:00');
      const data = [
        {
          ParkingGroupName: 'Green Day',
          Timestamp: '2024-01-15 14:00:00',
          CurrentFreeGroupCounterValue: 100
        },
        {
          ParkingGroupName: 'Uni Wroc',
          Timestamp: '2024-01-15 14:59:00',
          CurrentFreeGroupCounterValue: 20
        }
      ];
      const result = applyApproximations(data, now);
      expect(result[0].approximationInfo.isApproximated).toBe(true);
      expect(result[1].approximationInfo.isApproximated).toBe(false);
    });
  });
});
