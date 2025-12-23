/**
 * Utility functions for date and time operations
 */

/**
 * Parse timestamp value and return a Date object
 * @param {string} raw - Raw timestamp string (e.g., "2024-01-01 12:00:00" or "2024-01-01T12:00:00")
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseTimestamp = (raw) => {
  if (!raw) return null;
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Calculate age in minutes between two dates
 * @param {Date} from - Start date
 * @param {Date} to - End date (default: now)
 * @returns {number} Age in minutes
 */
export const getAgeInMinutes = (from, to = new Date()) => {
  if (!from || !to) return 0;
  return Math.max(0, Math.floor((to - from) / 1000 / 60));
};

/**
 * Format timestamp to locale time string
 * @param {Date|string} timestamp - Date object or timestamp string
 * @param {string} locale - Locale string (default: 'pl-PL')
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp, locale = 'pl-PL') => {
  if (!timestamp) return '--:--:--';
  const date = timestamp instanceof Date ? timestamp : parseTimestamp(timestamp);
  return date ? date.toLocaleTimeString(locale) : '--:--:--';
};

/**
 * Check if timestamp is stale (older than threshold)
 * @param {Date} timestamp - Timestamp to check
 * @param {number} thresholdMinutes - Threshold in minutes (default: 15)
 * @returns {boolean} True if stale
 */
export const isStaleTimestamp = (timestamp, thresholdMinutes = 15) => {
  if (!timestamp) return true;
  const age = getAgeInMinutes(timestamp);
  return age >= thresholdMinutes;
};
