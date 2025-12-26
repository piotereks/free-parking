import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useParkingStore, calculateDataAge, formatAgeLabel } from '@free-parking/shared';

const PARKING_MAX_CAPACITY = {
  'GreenDay': 200,
  'Uni Wroc': 150,
};

const COLUMN_ALIASES = {
  GD_TIME: 'gd_time',
  GD_VALUE: 'greenday free',
  UNI_TIME: 'uni_time',
  UNI_VALUE: 'uni free'
};

const normalizeGroupName = (rawName) => {
  if (!rawName) return 'Unknown';
  const name = rawName.trim();
  if (name === 'Bank_1') return 'Uni Wroc';
  return name;
};

/**
 * Mobile Statistics Screen
 * Displays historical parking data and trends
 * Reuses shared data layer and caching logic from @free-parking/shared
 */
export default function StatisticsScreen() {
  const historyData = useParkingStore((state) => state.historyData);
  const historyLoading = useParkingStore((state) => state.historyLoading);
  const lastHistoryUpdate = useParkingStore((state) => state.lastHistoryUpdate);

  const [stats, setStats] = useState({
    greenday: { avg: 0, min: 0, max: 0, samples: 0 },
    uni: { avg: 0, min: 0, max: 0, samples: 0 },
  });

  // Calculate statistics from history
  useEffect(() => {
    if (!historyData || historyData.length === 0) {
      setStats({
        greenday: { avg: 0, min: 0, max: 0, samples: 0 },
        uni: { avg: 0, min: 0, max: 0, samples: 0 },
      });
      return;
    }

    const gdValues = [];
    const uniValues = [];

    historyData.forEach((row) => {
      // Extract GreenDay values
      const gdValueRaw = row[COLUMN_ALIASES.GD_VALUE];
      if (gdValueRaw !== null && gdValueRaw !== undefined && gdValueRaw !== '') {
        const gdNum = Number(gdValueRaw);
        if (!Number.isNaN(gdNum)) {
          gdValues.push(gdNum);
        }
      }

      // Extract Uni values
      const uniValueRaw = row[COLUMN_ALIASES.UNI_VALUE];
      if (uniValueRaw !== null && uniValueRaw !== undefined && uniValueRaw !== '') {
        const uniNum = Number(uniValueRaw);
        if (!Number.isNaN(uniNum)) {
          uniValues.push(uniNum);
        }
      }
    });

    const calculateStats = (values) => {
      if (values.length === 0) {
        return { avg: 0, min: 0, max: 0, samples: 0 };
      }
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { avg, min, max, samples: values.length };
    };

    setStats({
      greenday: calculateStats(gdValues),
      uni: calculateStats(uniValues),
    });
  }, [historyData]);

  if (historyLoading && historyData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Parking Statistics</Text>

        {historyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No historical data yet</Text>
            <Text style={styles.emptySubtext}>
              Historical data will appear here once the app collects measurements.
            </Text>
          </View>
        ) : (
          <>
            {/* GreenDay Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>🅿️ GreenDay Parking</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average Free</Text>
                  <Text style={styles.statValue}>{stats.greenday.avg}</Text>
                  <Text style={styles.statSubtext}>/ {PARKING_MAX_CAPACITY['GreenDay']}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Minimum</Text>
                  <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                    {stats.greenday.min}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Maximum</Text>
                  <Text style={[styles.statValue, { color: '#34C759' }]}>
                    {stats.greenday.max}
                  </Text>
                </View>
              </View>
              <View style={styles.sampleCount}>
                <Text style={styles.sampleText}>
                  Based on {stats.greenday.samples} measurements
                </Text>
              </View>
            </View>

            {/* Uni/Bank Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>🏦 Uni Wroc Parking</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average Free</Text>
                  <Text style={styles.statValue}>{stats.uni.avg}</Text>
                  <Text style={styles.statSubtext}>/ {PARKING_MAX_CAPACITY['Uni Wroc']}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Minimum</Text>
                  <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                    {stats.uni.min}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Maximum</Text>
                  <Text style={[styles.statValue, { color: '#34C759' }]}>
                    {stats.uni.max}
                  </Text>
                </View>
              </View>
              <View style={styles.sampleCount}>
                <Text style={styles.sampleText}>
                  Based on {stats.uni.samples} measurements
                </Text>
              </View>
            </View>

            {/* Data Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📊 Data Information</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Records</Text>
                <Text style={styles.infoValue}>{historyData.length}</Text>
              </View>
              {lastHistoryUpdate && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Last Updated</Text>
                  <Text style={styles.infoValue}>
                    {lastHistoryUpdate.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Data Age</Text>
                <Text style={styles.infoValue}>
                  {formatAgeLabel(calculateDataAge(lastHistoryUpdate, new Date()))}
                </Text>
              </View>
            </View>

            {/* Insights */}
            <View style={styles.insightsCard}>
              <Text style={styles.infoTitle}>💡 Insights</Text>
              <View style={styles.insightItem}>
                <Text style={styles.insightText}>
                  • GreenDay averages {stats.greenday.avg} free spots (
                  {Math.round((stats.greenday.avg / PARKING_MAX_CAPACITY['GreenDay']) * 100)}% available)
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightText}>
                  • Uni Wroc averages {stats.uni.avg} free spots (
                  {Math.round((stats.uni.avg / PARKING_MAX_CAPACITY['Uni Wroc']) * 100)}% available)
                </Text>
              </View>
              {stats.greenday.samples > 0 && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightText}>
                    • Data collected over {Math.round(stats.greenday.samples / 6)} hours (at ~10 min intervals)
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#999',
  },
  sampleCount: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  sampleText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
