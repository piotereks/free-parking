import AsyncStorage from "@react-native-async-storage/async-storage";
import { debugLog } from '../config/debug';

export const createMobileStorageAdapter = () => ({
  get: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      const parsed = val ? JSON.parse(val) : null;
      debugLog('Storage.get', key, parsed ? 'HIT' : 'MISS');
      return parsed;
    } catch (e) {
      console.error("Storage get failed:", e);
      return null;
    }
  },

  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      debugLog('Storage.set', key);
    } catch (e) {
      console.error("Storage set failed:", e);
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      debugLog('Storage.remove', key);
    } catch (e) {
      console.error("Storage remove failed:", e);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Storage clear failed:", e);
    }
  },
});
