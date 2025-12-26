import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useParkingStore, calculateDataAge, formatAgeLabel, applyApproximations } from '@free-parking/shared';
import { storageMobile } from '../adapters/storageMobile';

const PARKING_MAX_CAPACITY = {
  'GreenDay': 200,
  'Uni Wroc': 150,
};

const normalizeGroupName = (rawName) => {
  if (!rawName) return 'Unknown';
  const name = rawName.trim();
  if (name === 'Bank_1') return 'Uni Wroc';
  return name;
};

/**
 * Mobile Dashboard Screen
 * Displays real-time parking availability with live refresh
 * Reuses shared data layer and caching logic from @free-parking/shared
 */
export default function DashboardScreen() {
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);
  const setRefreshCallback = useParkingStore((state) => state.setRefreshCallback);
  const refreshParkingData = useParkingStore((state) => state.refreshParkingData);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dataAge, setDataAge] = React.useState(0);

  // Update data age label every minute
  useEffect(() => {
    const updateAge = () => {
      if (lastRealtimeUpdate) {
        const age = calculateDataAge(lastRealtimeUpdate, new Date());
        setDataAge(age);
      }
    };

    updateAge();
    const timer = setInterval(updateAge, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [lastRealtimeUpdate]);

  // Initialize parking data fetching
  useEffect(() => {
    refreshParkingData();

    // Set up auto-refresh every 5 minutes
    const autoRefreshTimer = setInterval(() => {
      refreshParkingData();
    }, 5 * 60 * 1000);

    setRefreshCallback(() => () => clearInterval(autoRefreshTimer));

    return () => clearInterval(autoRefreshTimer);
  }, [refreshParkingData, setRefreshCallback]);

  // Handle manual refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshParkingData();
    } catch (error) {
      console.error('Refresh failed:', error);
      Alert.alert('Refresh Failed', 'Could not fetch parking data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshParkingData]);

  // Format parking data for display
  const formatParkingCards = () => {
    if (!realtimeData || realtimeData.length === 0) {
      return [];
    }

    const now = new Date();
    const approximated = applyApproximations(realtimeData, now);

    return approximated.map((entry, index) => {
      const groupName = normalizeGroupName(entry.GroupName);
      const currentValue = entry.CurrentFreeGroupCounterValue ?? 0;
      const maxCapacity = PARKING_MAX_CAPACITY[groupName] || 200;
      const isStale = dataAge > 15; // Mark as stale if older than 15 minutes

      return {
        id: `${groupName}-${index}`,
        groupName,
        currentValue,
        maxCapacity,
        percentFull: Math.round((currentValue / maxCapacity) * 100),
        isStale,
        ageLabel: formatAgeLabel(dataAge),
      };
    });
  };

  const cards = formatParkingCards();

  // Determine status color based on capacity
  const getStatusColor = (percentFull) => {
    if (percentFull < 50) return '#34C759'; // Green - plenty available
    if (percentFull < 80) return '#FF9500'; // Orange - getting full
    return '#FF3B30'; // Red - full
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.parkingName}>{item.groupName}</Text>
        {item.isStale && <Text style={styles.staleLabel}>Stale Data</Text>}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.capacitySection}>
          <Text style={[styles.capacityNumber, { color: getStatusColor(item.percentFull) }]}>
            {item.currentValue}
          </Text>
          <Text style={styles.capacityTotal}>/ {item.maxCapacity} spots</Text>
        </View>

        <View
          style={[
            styles.progressBar,
            { backgroundColor: getStatusColor(item.percentFull) },
            { width: `${item.percentFull}%` },
          ]}
        />

        <Text style={styles.percentText}>{item.percentFull}% full</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.ageText}>Data age: {item.ageLabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {realtimeError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Error: {realtimeError}</Text>
        </View>
      )}

      {realtimeLoading && cards.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching parking data...</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No parking data available</Text>
            </View>
          }
        />
      )}

      {lastRealtimeUpdate && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {lastRealtimeUpdate.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  listContent: {
    padding: 12,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parkingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  staleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardContent: {
    marginBottom: 12,
  },
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  capacityNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  capacityTotal: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#34C759',
    borderRadius: 4,
    marginBottom: 8,
  },
  percentText: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  ageText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
