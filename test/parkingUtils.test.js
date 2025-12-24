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
  PARKING_MAX_CAPACITY
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

  describe('calculateDataAge', () => {
    it('calculates age in minutes correctly', () => {
      const now = new Date('2024-01-15 15:00:00');
      const timestamp = '2024-01-15 14:30:00';
      expect(calculateDataAge(timestamp, now)).toBe(30);
    });

    it('returns 0 for current data', () => {
      const now = new Date('2024-01-15 15:00:00');
      const timestamp = '2024-01-15 15:00:00';
      expect(calculateDataAge(timestamp, now)).toBe(0);
    });

    it('returns Infinity for missing timestamp', () => {
      const now = new Date();
      expect(calculateDataAge(null, now)).toBe(Infinity);
      expect(calculateDataAge('', now)).toBe(Infinity);
    });

    it('handles timestamp with T separator', () => {
      const now = new Date('2024-01-15T15:00:00');
      const timestamp = '2024-01-15T14:45:00';
      expect(calculateDataAge(timestamp, now)).toBe(15);
    });
  });

  describe('getMaxCapacity', () => {
    it('returns correct capacity for GreenDay', () => {
      expect(getMaxCapacity('GreenDay')).toBe(PARKING_MAX_CAPACITY.GreenDay);
    });

    it('returns correct capacity for Bank_1', () => {
      expect(getMaxCapacity('Bank_1')).toBe(PARKING_MAX_CAPACITY.Bank_1);
    });

    it('returns correct capacity for normalized name', () => {
      expect(getMaxCapacity('Uni Wroc')).toBe(PARKING_MAX_CAPACITY['Uni Wroc']);
    });

    it('returns default capacity for unknown parking', () => {
      expect(getMaxCapacity('Unknown')).toBe(100);
    });
  });

  describe('calculateApproximation', () => {
    it('returns no approximation when data is fresh', () => {
      const now = new Date('2024-01-15 15:00:00');
      const staleData = {
        ParkingGroupName: 'GreenDay',
        CurrentFreeGroupCounterValue: 50,
        Timestamp: '2024-01-15 14:50:00' // 10 minutes old
      };
      const freshData = {
        ParkingGroupName: 'Bank_1',
        CurrentFreeGroupCounterValue: 30,
        Timestamp: '2024-01-15 14:58:00'
      };
      
      const result = calculateApproximation(staleData, freshData, now);
      expect(result.isApproximated).toBe(false);
      expect(result.approximated).toBe(50);
      expect(result.original).toBe(50);
    });

    it('calculates approximation when data is stale', () => {
      const now = new Date('2024-01-15 15:00:00');
      const staleData = {
        ParkingGroupName: 'GreenDay',
        CurrentFreeGroupCounterValue: 50,
        Timestamp: '2024-01-15 14:00:00' // 60 minutes old
      };
      const freshData = {
        ParkingGroupName: 'Bank_1',
        CurrentFreeGroupCounterValue: 30,
        Timestamp: '2024-01-15 14:58:00'
      };
      
      const result = calculateApproximation(staleData, freshData, now);
      expect(result.isApproximated).toBe(true);
      expect(result.original).toBe(50);
      // Fresh ratio: 30/100 = 0.3, applied to stale max: 0.3 * 150 = 45
      expect(result.approximated).toBe(45);
    });

    it('handles threshold boundary at 30 minutes', () => {
      const now = new Date('2024-01-15 15:00:00');
      const staleData = {
        ParkingGroupName: 'GreenDay',
        CurrentFreeGroupCounterValue: 50,
        Timestamp: '2024-01-15 14:30:00' // exactly 30 minutes old
      };
      const freshData = {
        ParkingGroupName: 'Bank_1',
        CurrentFreeGroupCounterValue: 30,
        Timestamp: '2024-01-15 14:58:00'
      };
      
      const result = calculateApproximation(staleData, freshData, now);
      expect(result.isApproximated).toBe(true);
    });

    it('returns null info when data is missing', () => {
      const result = calculateApproximation(null, null);
      expect(result.approximated).toBeNull();
      expect(result.isApproximated).toBe(false);
      expect(result.reason).toBe('Missing data');
    });
  });

  describe('applyApproximations', () => {
    it('applies approximation to first area when stale', () => {
      const now = new Date('2024-01-15 15:00:00');
      const parkingData = [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2024-01-15 14:00:00' // 60 minutes old
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 30,
          Timestamp: '2024-01-15 14:58:00' // 2 minutes old
        }
      ];
      
      const result = applyApproximations(parkingData, now);
      expect(result[0].approximationInfo.isApproximated).toBe(true);
      expect(result[0].approximationInfo.approximated).toBe(45); // (30/100) * 150
      expect(result[1].approximationInfo.isApproximated).toBe(false);
    });

    it('applies approximation to second area when stale', () => {
      const now = new Date('2024-01-15 15:00:00');
      const parkingData = [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 60,
          Timestamp: '2024-01-15 14:58:00' // 2 minutes old
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 30,
          Timestamp: '2024-01-15 14:00:00' // 60 minutes old
        }
      ];
      
      const result = applyApproximations(parkingData, now);
      expect(result[0].approximationInfo.isApproximated).toBe(false);
      expect(result[1].approximationInfo.isApproximated).toBe(true);
      expect(result[1].approximationInfo.approximated).toBe(40); // (60/150) * 100
    });

    it('does not approximate when both areas are fresh', () => {
      const now = new Date('2024-01-15 15:00:00');
      const parkingData = [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 60,
          Timestamp: '2024-01-15 14:58:00'
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 30,
          Timestamp: '2024-01-15 14:57:00'
        }
      ];
      
      const result = applyApproximations(parkingData, now);
      expect(result[0].approximationInfo.isApproximated).toBe(false);
      expect(result[1].approximationInfo.isApproximated).toBe(false);
    });

    it('handles empty array', () => {
      const result = applyApproximations([]);
      expect(result).toEqual([]);
    });

    it('handles single parking area', () => {
      const now = new Date('2024-01-15 15:00:00');
      const parkingData = [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 60,
          Timestamp: '2024-01-15 14:00:00'
        }
      ];
      
      const result = applyApproximations(parkingData, now);
      expect(result.length).toBe(1);
      expect(result[0].approximationInfo.isApproximated).toBe(false);
    });

    it('handles more than two parking areas', () => {
      const now = new Date('2024-01-15 15:00:00');
      const parkingData = [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 60,
          Timestamp: '2024-01-15 14:00:00'
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 30,
          Timestamp: '2024-01-15 14:00:00'
        },
        {
          ParkingGroupName: 'Parking3',
          CurrentFreeGroupCounterValue: 20,
          Timestamp: '2024-01-15 14:00:00'
        }
      ];
      
      const result = applyApproximations(parkingData, now);
      expect(result.length).toBe(3);
      // No approximation should happen when there are more than 2 areas
      expect(result[0].approximationInfo.isApproximated).toBe(false);
      expect(result[1].approximationInfo.isApproximated).toBe(false);
      expect(result[2].approximationInfo.isApproximated).toBe(false);
    });
  });
});
