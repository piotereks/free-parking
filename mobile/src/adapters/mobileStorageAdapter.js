import AsyncStorage from "@react-native-async-storage/async-storage";

export const createMobileStorageAdapter = () => ({
  get: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error("Storage get failed:", e);
      return null;
    }
  },

  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage set failed:", e);
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
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
