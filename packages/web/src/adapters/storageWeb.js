/**
 * Web storage adapter using localStorage
 * Wraps synchronous localStorage API in Promises for cross-platform compatibility
 */

export const storageWeb = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Stored value or null
   */
  async getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`localStorage getItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`localStorage setItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`localStorage removeItem error for key "${key}":`, error);
      throw error;
    }
  },
};
