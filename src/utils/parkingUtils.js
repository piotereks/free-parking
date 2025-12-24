/**
 * Utility functions for parking data operations
 */

// Maximum capacity for each parking area
// These values are documented in README.md and used in Statistics.jsx
export const PARKING_MAX_CAPACITY = {
  'GreenDay': 187,
  'Bank_1': 41,  // Uni Wroc
  'Uni Wroc': 41
};

// Default capacity for unknown parking areas
export const DEFAULT_PARKING_CAPACITY = 100;

// Threshold for approximation (in minutes)
export const APPROXIMATION_THRESHOLD_MINUTES = 30;

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

/**
 * Calculate age of parking data in minutes
 * @param {string} timestamp - Timestamp string
 * @param {Date} now - Current time
 * @returns {number} Age in minutes
 */
export const calculateDataAge = (timestamp, now = new Date()) => {
  if (!timestamp) return Infinity;
  const ts = new Date(timestamp.replace(' ', 'T'));
  return Math.max(0, Math.floor((now - ts) / 1000 / 60));
};

/**
 * Get maximum capacity for a parking area
 * @param {string} parkingName - Name of the parking area
 * @returns {number} Maximum capacity
 */
export const getMaxCapacity = (parkingName) => {
  return PARKING_MAX_CAPACITY[parkingName] || PARKING_MAX_CAPACITY[normalizeParkingName(parkingName)] || DEFAULT_PARKING_CAPACITY;
};

/**
 * Calculate approximated free spaces based on another parking area's ratio
 * @param {Object} staleData - The parking data that's stale (>30 min old)
 * @param {Object} freshData - The parking data that's fresh
 * @param {Date} now - Current time
 * @returns {Object} Object with approximated value and metadata
 */
export const calculateApproximation = (staleData, freshData, now = new Date()) => {
  if (!staleData || !freshData) {
    return {
      approximated: null,
      original: null,
      isApproximated: false,
      reason: 'Missing data'
    };
  }

  const staleAge = calculateDataAge(staleData.Timestamp, now);
  
  // If data is not stale, no approximation needed
  if (staleAge < APPROXIMATION_THRESHOLD_MINUTES) {
    return {
      approximated: staleData.CurrentFreeGroupCounterValue || 0,
      original: staleData.CurrentFreeGroupCounterValue || 0,
      isApproximated: false,
      ageMinutes: staleAge
    };
  }

  // Get maximum capacities
  const staleMax = getMaxCapacity(staleData.ParkingGroupName);
  const freshMax = getMaxCapacity(freshData.ParkingGroupName);
  
  // Calculate fresh area ratio
  const freshFree = freshData.CurrentFreeGroupCounterValue || 0;
  const freshRatio = freshFree / freshMax;
  
  // Apply ratio to stale area's maximum
  const approximated = Math.round(freshRatio * staleMax);
  
  return {
    approximated,
    original: staleData.CurrentFreeGroupCounterValue || 0,
    isApproximated: true,
    ageMinutes: staleAge,
    freshRatio,
    calculation: `(${freshFree} / ${freshMax}) * ${staleMax} = ${approximated}`
  };
};

/**
 * Process parking data array and apply approximations where needed
 * @param {Array} parkingData - Array of parking data objects
 * @param {Date} now - Current time
 * @returns {Array} Processed parking data with approximations
 */
export const applyApproximations = (parkingData, now = new Date()) => {
  if (!Array.isArray(parkingData) || parkingData.length === 0) {
    return [];
  }

  // If we don't have exactly 2 parking areas, just add metadata without approximation
  if (parkingData.length !== 2) {
    return parkingData.map(data => ({
      ...data,
      approximationInfo: {
        isApproximated: false,
        original: data.CurrentFreeGroupCounterValue || 0,
        approximated: data.CurrentFreeGroupCounterValue || 0,
        ageMinutes: calculateDataAge(data?.Timestamp, now)
      }
    }));
  }

  // Typically we have 2 parking areas: GreenDay (index 0) and Bank_1/Uni (index 1)
  const area1 = parkingData[0];
  const area2 = parkingData[1];
  
  const age1 = calculateDataAge(area1?.Timestamp, now);
  const age2 = calculateDataAge(area2?.Timestamp, now);
  
  const result = [];
  
  // Process first parking area
  if (age1 >= APPROXIMATION_THRESHOLD_MINUTES && age2 < APPROXIMATION_THRESHOLD_MINUTES) {
    const approxInfo = calculateApproximation(area1, area2, now);
    result.push({
      ...area1,
      approximationInfo: approxInfo
    });
  } else {
    result.push({
      ...area1,
      approximationInfo: {
        isApproximated: false,
        original: area1?.CurrentFreeGroupCounterValue || 0,
        approximated: area1?.CurrentFreeGroupCounterValue || 0,
        ageMinutes: age1
      }
    });
  }
  
  // Process second parking area
  if (age2 >= APPROXIMATION_THRESHOLD_MINUTES && age1 < APPROXIMATION_THRESHOLD_MINUTES) {
    const approxInfo = calculateApproximation(area2, area1, now);
    result.push({
      ...area2,
      approximationInfo: approxInfo
    });
  } else {
    result.push({
      ...area2,
      approximationInfo: {
        isApproximated: false,
        original: area2?.CurrentFreeGroupCounterValue || 0,
        approximated: area2?.CurrentFreeGroupCounterValue || 0,
        ageMinutes: age2
      }
    });
  }
  
  return result;
};
