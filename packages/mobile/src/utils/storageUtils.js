/**
 * Mobile-specific utility functions
 * Location services, permissions, and platform-specific helpers
 */

import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';

/**
 * Request location permissions from user
 * Handles iOS/Android permission differences
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Check if location permission is already granted
 * @returns {Promise<boolean>}
 */
export async function checkLocationPermission() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get current device location
 * Returns null if permission denied or location unavailable
 * @returns {Promise<{latitude: number, longitude: number}|null>}
 */
export async function getCurrentLocation() {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        console.warn('Location permission denied');
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates (in km)
 * Uses Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get platform-specific information
 * @returns {Object} Platform details
 */
export function getPlatformInfo() {
  return {
    platform: Platform.OS, // 'ios' or 'android'
    version: Platform.Version,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
}

/**
 * Show platform-appropriate alert dialog
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Button configurations
 */
export function showAlert(title, message, buttons = [{ text: 'OK' }]) {
  Alert.alert(title, message, buttons);
}

/**
 * Format distance for display
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(km) {
  if (km < 0.1) {
    return `${(km * 1000).toFixed(0)}m away`;
  }
  return `${km.toFixed(1)}km away`;
}

/**
 * Validate parking location coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Get human-readable location name (mock for now)
 * Can be extended with reverse geocoding later
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Location name or coordinates string
 */
export async function getLocationName(latitude, longitude) {
  try {
    if (!isValidCoordinate(latitude, longitude)) {
      return 'Invalid coordinates';
    }
    
    // Mock implementation - could use reverse geocoding API
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Unknown location';
  }
}

/**
 * Notify user about permission requirements
 * @param {string} permissionName - Name of permission needed
 */
export function showPermissionAlert(permissionName) {
  showAlert(
    'Permission Required',
    `This feature requires ${permissionName} permission. Please enable it in settings.`,
    [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Settings',
        onPress: () => {
          // In a real app, this would open settings
          console.log('Open settings');
        },
      },
    ]
  );
}
