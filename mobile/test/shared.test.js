/**
 * Jest test suite for shared package integration
 * Validates that ../shared/src/index.js imports resolve correctly via Metro bundler
 */

import {
  testSharedImports,
  testSharedFunctionality,
} from '../src/testShared';

import {
  normalizeParkingName,
  calculateDataAge,
  formatAgeLabel,
  parseTimestamp,
  createParkingStore,
  PARKING_MAX_CAPACITY,
} from '../shared/src/index.js';

describe('Shared Package Integration', () => {
  describe('Import Verification', () => {
    it('should import all utilities from ../shared/src/index.js', () => {
      const results = testSharedImports();
      
      expect(results.parkingUtils).toBe(true);
      expect(results.dateUtils).toBe(true);
      expect(results.createParkingStore).toBe(true);
      expect(results.constants).toBe(true);
    });

    it('should have parking constants defined', () => {
      expect(PARKING_MAX_CAPACITY).toBeDefined();
      expect(PARKING_MAX_CAPACITY['Green Day']).toBe(187);
      expect(PARKING_MAX_CAPACITY['Uni Wroc']).toBe(41);
    });
  });

  describe('Parking Utils', () => {
    it('should normalize parking names correctly', () => {
      expect(normalizeParkingName('Bank_1')).toBe('Uni Wroc');
      expect(normalizeParkingName('Green Day')).toBe('Green Day');
      expect(normalizeParkingName('')).toBe('Unknown');
      expect(normalizeParkingName(null)).toBe('Unknown');
    });

    it('should calculate data age in minutes', () => {
      const now = new Date('2026-01-01T12:05:00');
      const timestamp = '2026-01-01T12:00:00';
      
      expect(calculateDataAge(timestamp, now)).toBe(5);
    });
  });

  describe('Date Utils', () => {
    it('should parse timestamps correctly', () => {
      const timestamp = parseTimestamp('2026-01-01 12:00:00');
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getFullYear()).toBe(2026);
      expect(timestamp.getMonth()).toBe(0); // January = 0
      expect(timestamp.getDate()).toBe(1);
    });

    it('should format age labels with display and aria properties', () => {
      // Test object structure
      expect(formatAgeLabel(0)).toHaveProperty('display');
      expect(formatAgeLabel(0)).toHaveProperty('aria');
      
      // Test display values for minutes range
      expect(formatAgeLabel(0).display).toBe('0 min ago');
      expect(formatAgeLabel(1).display).toBe('1 min ago');
      expect(formatAgeLabel(5).display).toBe('5 min ago');
      expect(formatAgeLabel(59).display).toBe('59 min ago');
      
      // Test display values for hours range
      expect(formatAgeLabel(60).display).toBe('1 h ago');
      expect(formatAgeLabel(120).display).toBe('2 h ago');
      expect(formatAgeLabel(360).display).toBe('6 h ago');
      
      // Test aria labels
      expect(formatAgeLabel(0).aria).toContain('0 minutes');
      expect(formatAgeLabel(1).aria).toContain('1 minute');
      expect(formatAgeLabel(5).aria).toContain('5 minutes');
    });
  });

  describe('Store Factory', () => {
    it('should export createParkingStore as a function', () => {
      expect(typeof createParkingStore).toBe('function');
    });

    it('should create store with mock adapters', () => {
      const mockStorage = {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
      };

      const mockFetch = {
        fetch: jest.fn(),
      };

      const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
      };

      const store = createParkingStore({
        storage: mockStorage,
        fetch: mockFetch,
        logger: mockLogger,
      });

      expect(store).toBeDefined();
      expect(typeof store).toBe('function'); // Zustand returns a hook function
    });
  });

  describe('Shared Functionality Tests', () => {
    it('should pass all functionality tests', () => {
      const results = testSharedFunctionality();
      
      expect(results.normalizeParkingName).toBe(true);
      expect(results.calculateDataAge).toBe(true);
      expect(results.formatAgeLabel).toBe(true);
      expect(results.parseTimestamp).toBe(true);
      expect(results.createParkingStore).toBe(true);
    });
  });
});
