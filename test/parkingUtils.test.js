import { describe, it, expect } from 'vitest';
import {
  normalizeParkingName,
  getAgeClass,
  calculateTotalSpaces,
  isValidParkingData
} from '../src/utils/parkingUtils';

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

    it('returns false for null', () => {
      const result = isValidParkingData(null);
      expect(result).toBe(false);
    });

    it('returns false for undefined', () => {
      const result = isValidParkingData(undefined);
      expect(result).toBe(false);
    });

    it('returns false for non-object types', () => {
      expect(isValidParkingData('string')).toBe(false);
      expect(isValidParkingData(123)).toBe(false);
      expect(isValidParkingData(true)).toBe(false);
    });

    it('returns false for array', () => {
      expect(isValidParkingData([])).toBe(false);
    });

    it('returns true even with extra fields', () => {
      const data = {
        ParkingGroupName: 'Test Parking',
        Timestamp: '2024-01-15 14:30:00',
        CurrentFreeGroupCounterValue: 10,
        extraField: 'extra value'
      };
      expect(isValidParkingData(data)).toBe(true);
    });

    it('accepts zero as valid CurrentFreeGroupCounterValue', () => {
      const data = {
        ParkingGroupName: 'Test Parking',
        Timestamp: '2024-01-15 14:30:00',
        CurrentFreeGroupCounterValue: 0
      };
      expect(isValidParkingData(data)).toBe(true);
    });
  });
});
