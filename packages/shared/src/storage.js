/**
 * Storage adapter interface for cross-platform key-value storage
 * Web implementation uses localStorage, React Native uses AsyncStorage
 */

/**
 * Get item from storage
 * @param {string} key - Storage key
 * @returns {Promise<string|null>} Stored value or null
 */
export async function getItem(key) {
  throw new Error('Storage adapter not implemented');
}

/**
 * Set item in storage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {Promise<void>}
 */
export async function setItem(key, value) {
  throw new Error('Storage adapter not implemented');
}

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function removeItem(key) {
  throw new Error('Storage adapter not implemented');
}
