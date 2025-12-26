import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useParkingStore, clearCache } from '@free-parking/shared';
import Ionicons from '@expo/vector-icons/Ionicons';

const APP_VERSION = '1.0.0';

/**
 * Mobile Settings Screen
 * User preferences, cache management, and app information
 */
export default function SettingsScreen() {
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);
  const lastHistoryUpdate = useParkingStore((state) => state.lastHistoryUpdate);
  const historyData = useParkingStore((state) => state.historyData);
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const refreshParkingData = useParkingStore((state) => state.refreshParkingData);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate approximate cache size
  const calculateCacheSize = () => {
    let size = 0;
    try {
      if (lastRealtimeUpdate) {
        size += JSON.stringify({ realtimeData, timestamp: lastRealtimeUpdate.toISOString() }).length;
      }
      if (lastHistoryUpdate && historyData.length > 0) {
        size += JSON.stringify({ data: historyData, timestamp: lastHistoryUpdate.toISOString() }).length;
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
    }
    return (size / 1024).toFixed(2); // Convert to KB
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache?',
      'This will delete all cached parking data. New data will be fetched on next refresh.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsClearing(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshParkingData();
      Alert.alert('Success', 'Parking data refreshed');
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        {/* Cache Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Management</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Cache Size</Text>
                <Text style={styles.cardValue}>{calculateCacheSize()} KB</Text>
              </View>
              <Ionicons name="storage" size={24} color="#007AFF" />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleForceRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.buttonText}>Force Refresh</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearCache}
            disabled={isClearing}
          >
            {isClearing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.buttonText}>Clear Cache</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Data Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Status</Text>

          <View style={styles.card}>
            <View style={styles.dataRow}>
              <View>
                <Text style={styles.dataLabel}>Real-time Data</Text>
                <Text style={styles.dataTime}>{formatDate(lastRealtimeUpdate)}</Text>
              </View>
              <View style={styles.recordBadge}>
                <Text style={styles.recordCount}>{realtimeData?.length || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.dataRow}>
              <View>
                <Text style={styles.dataLabel}>Historical Data</Text>
                <Text style={styles.dataTime}>{formatDate(lastHistoryUpdate)}</Text>
              </View>
              <View style={styles.recordBadge}>
                <Text style={styles.recordCount}>{historyData?.length || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Coming soon</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                disabled={true}
                trackColor={{ false: '#E5E5EA', true: '#81C784' }}
                thumbColor={isDarkMode ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>{APP_VERSION}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Build Type</Text>
              <Text style={styles.aboutValue}>Expo</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Free Parking is a real-time parking availability monitor for Wrocław. 
              Data is updated every 5 minutes.
            </Text>
          </View>
        </View>

        {/* Debug Section (optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>

          <View style={styles.debugCard}>
            <Text style={styles.debugText}>
              Realtime records: {realtimeData?.length || 0}
            </Text>
            <Text style={styles.debugText}>
              History records: {historyData?.length || 0}
            </Text>
            <Text style={styles.debugText}>
              Cache size: {calculateCacheSize()} KB
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  dataTime: {
    fontSize: 12,
    color: '#999',
  },
  recordBadge: {
    backgroundColor: '#E5F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#E5F0FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  debugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Menlo',
  },
});
