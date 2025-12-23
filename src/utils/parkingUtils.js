/**
 * Utility functions for parking data operations
 */

/**
 * Normalize parking name for display
 * @param {string} name - Raw parking name
 * @returns {string} Normalized name
 */
export const normalizeParkingName = (name) => {
  if (!name) return 'Unknown';
  if (name === 'Bank_1') return 'Uni Wroc';
  return name;
};

/**
 * Get age class for styling based on data age
 * @param {number} ageMinutes - Age in minutes
 * @returns {string} CSS class name
 */
export const getAgeClass = (ageMinutes) => {
  if (ageMinutes >= 15) return 'age-old';
  if (ageMinutes > 5) return 'age-medium';
  return '';
};

/**
 * Calculate total free spaces across all parking data
 * @param {Array} parkingData - Array of parking objects
 * @returns {number} Total free spaces
 */
export const calculateTotalSpaces = (parkingData) => {
  if (!Array.isArray(parkingData)) return 0;
  return parkingData.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);
};

/**
 * Validate parking data structure
 * @param {Object} data - Parking data object
 * @returns {boolean} True if valid
 */
export const isValidParkingData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return (
    'ParkingGroupName' in data &&
    'Timestamp' in data &&
    'CurrentFreeGroupCounterValue' in data
  );
};
