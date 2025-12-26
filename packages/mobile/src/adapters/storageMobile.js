/**
 * React Native storage adapter using AsyncStorage
 * Implements the same interface as storageWeb.js for cross-platform compatibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageMobile = {
  /**
   * Get item from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Stored value or null
   */
  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`AsyncStorage getItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set item in AsyncStorage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`AsyncStorage setItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove item from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage removeItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Clear all items from AsyncStorage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  },
};
