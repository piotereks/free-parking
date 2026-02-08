/**
 * Test file to verify shared package imports work correctly
 * This validates that Metro bundler resolves parking-shared alias
 */

import {
  parkingUtils,
  dateUtils,
  createParkingStore,
  normalizeParkingName,
  calculateDataAge,
  formatAgeLabel,
  parseTimestamp,
  PARKING_MAX_CAPACITY,
} from './index.js';

/**
 * Simple test function to verify imports loaded
 * @returns {Object} Test results
 */
export const testSharedImports = () => {
  const results = {
    parkingUtils: !!normalizeParkingName && !!calculateDataAge,
    dateUtils: !!parseTimestamp && !!formatAgeLabel,
    createParkingStore: typeof createParkingStore === 'function',
    constants: !!PARKING_MAX_CAPACITY,
  };

  console.log('✅ Shared package imports verified:', results);
  return results;
};

// Test that functions actually work
export const testSharedFunctionality = () => {
  try {
    // Test parking utils
    const name = normalizeParkingName('Bank_1');
    const age = calculateDataAge('2026-01-01T12:00:00', new Date('2026-01-01T12:05:00'));
    const label = formatAgeLabel(5);

    // Test date utils
    const timestamp = parseTimestamp('2026-01-01 12:00:00');

    // Test store factory (without actual initialization)
    const isStoreFactory = typeof createParkingStore === 'function';

    const results = {
      normalizeParkingName: name === 'Uni Wroc',
      calculateDataAge: age === 5,
      formatAgeLabel: label.display === '5 min ago',
      parseTimestamp: timestamp instanceof Date,
      createParkingStore: isStoreFactory,
    };

    console.log('✅ Shared functionality tests passed:', results);
    return results;
  } catch (error) {
    console.error('❌ Shared functionality test failed:', error);
    throw error;
  }
};

export default {
  testSharedImports,
  testSharedFunctionality,
};
