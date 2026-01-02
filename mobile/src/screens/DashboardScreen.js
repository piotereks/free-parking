/* global setInterval, clearInterval */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import useParkingStore from '../hooks/useParkingStore';
import { applyApproximations } from 'parking-shared';
import ParkingCard from '../components/ParkingCard';
import LoadingSkeletonCard from '../components/LoadingSkeletonCard';

const DashboardScreen = () => {
  const colorScheme = useColorScheme();
  const [now, setNow] = useState(() => new Date());

  const realtimeData = useParkingStore((s) => s.realtimeData);
  const realtimeLoading = useParkingStore((s) => s.realtimeLoading);
  const realtimeError = useParkingStore((s) => s.realtimeError);
  const refreshCallback = useParkingStore((s) => s.refreshCallback);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Trigger a refresh on mount if a refreshCallback is registered by the
  // DataManager (this is a no-op if not provided).
  useEffect(() => {
    let cancelled = false;
    const doRefresh = async () => {
      if (typeof refreshCallback === 'function') {
        try {
          await refreshCallback();
        } catch (e) {
          // store surfaces errors; ignore here
        }
      }
    };
    // call after mount
    void doRefresh();
    return () => {
      cancelled = true;
    };
  }, [refreshCallback]);

  const onRefresh = async () => {
    if (typeof refreshCallback === 'function') {
      try {
        await refreshCallback();
      } catch (e) {
        // ignore, store will surface error state
      }
    }
  };

  const data = useMemo(() => Array.isArray(realtimeData) ? realtimeData : [], [realtimeData]);

  // Apply shared approximations to the realtime data for display (age-aware)
  const processedData = useMemo(() => {
    try {
      return applyApproximations(Array.isArray(data) ? data : [], now);
    } catch (e) {
      return data;
    }
  }, [data, now]);

  const renderItem = ({ item }) => (
    <ParkingCard data={item} now={now} />
  );

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.dark : styles.light]}>
      <View style={styles.header}>
        <Text style={styles.title}>Parking Dashboard</Text>
        <Text style={styles.subtitle}>{`Updated: ${now.toLocaleTimeString()}`}</Text>
      </View>

      {realtimeLoading && (
        <FlatList
          data={[1,2,3,4]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <LoadingSkeletonCard />}
        />
      )}

      {realtimeError && !realtimeLoading && (
        <View style={styles.center}> 
          <Text style={styles.error}>Error loading data. Pull to retry.</Text>
        </View>
      )}

      {!realtimeLoading && !realtimeError && data.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>No parking data available.</Text>
        </View>
      )}

      {!realtimeLoading && processedData.length > 0 && (
        <FlatList
          data={processedData}
          keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={realtimeLoading} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#b00020' },
  empty: { color: '#666' },
  light: { backgroundColor: '#fff' },
  dark: { backgroundColor: '#0b0b0b' },
});

export default DashboardScreen;
