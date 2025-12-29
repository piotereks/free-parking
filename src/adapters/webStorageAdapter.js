/**
 * Web Storage Adapter - wraps localStorage with async interface
 * Compatible with parking-shared StorageAdapter interface
 */

export const webStorageAdapter = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<any|null>} Parsed value or null if not found
   */
  get: async (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item ${key} from localStorage:`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @returns {Promise<void>}
   */
  set: async (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item ${key} in localStorage:`, error);
      throw error;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  remove: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key} from localStorage:`, error);
      throw error;
    }
  },

  /**
   * Clear all items from localStorage
   * @returns {Promise<void>}
   */
  clear: async () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  },
};
