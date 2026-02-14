/* global setInterval, clearInterval */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';
import { applyApproximations, isValidParkingData, normalizeParkingName, calculateDataAge, formatAgeLabel, formatTime } from 'parking-shared';
import { debugLog } from '../config/debug';
import ParkingCard from '../components/ParkingCard';
import LoadingSkeletonCard from '../components/LoadingSkeletonCard';

const DashboardScreen = () => {
  const { colors, isDark } = useTheme();
  const [now, setNow] = useState(() => new Date());

  // Debug: Log theme colors
  useEffect(() => {
    debugLog('DashboardScreen: Theme applied', { isDark, background: colors.background, text: colors.text });
  }, [isDark, colors]);

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
        debugLog('DashboardScreen: mount-triggered refreshCallback invoking');
        try {
          await refreshCallback();
          debugLog('DashboardScreen: mount-triggered refreshCallback completed');
        } catch (e) {
          debugLog('DashboardScreen: mount-triggered refreshCallback error', e?.message || e);
        }
      } else {
        debugLog('DashboardScreen: no refreshCallback registered on mount');
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
      debugLog('DashboardScreen: user-initiated onRefresh invoking refreshCallback');
      try {
        await refreshCallback();
        debugLog('DashboardScreen: user-initiated onRefresh completed');
      } catch (e) {
        debugLog('DashboardScreen: user-initiated onRefresh error', e?.message || e);
      }
    } else {
      debugLog('DashboardScreen: user-initiated onRefresh but no refreshCallback registered');
    }
  };

  const data = useMemo(() => Array.isArray(realtimeData) ? realtimeData : [], [realtimeData]);

  // Apply shared approximations to the realtime data for display (age-aware)
  const processedData = useMemo(() => {
    try {
      // First apply approximations from shared (age-aware), then validate
      const approxed = Array.isArray(data) ? applyApproximations(data, now) : [];
      const validData = Array.isArray(approxed) ? approxed.filter(isValidParkingData) : [];

      // Normalize and format data
      return validData.map((item) => {
        const ageMinutes = calculateDataAge(item.Timestamp, now);
        const { display: ageDisplay } = formatAgeLabel(ageMinutes);

        return {
          ...item,
          name: normalizeParkingName(item.ParkingGroupName),
          freeSpaces: item.CurrentFreeGroupCounterValue,
          timestamp: item.Timestamp,
          ageDisplay,
        };
      });
    } catch (e) {
      console.error('Error processing data:', e);
      return data;
    }
  }, [data, now]);

  // Calculate the most recent data timestamp (used for the header "Updated:" label)
  const lastDataDate = useMemo(() => {
    if (!Array.isArray(processedData) || processedData.length === 0) return null;
    let max = null;
    for (const it of processedData) {
      const ts = it.timestamp || it.Timestamp;
      if (!ts) continue;
      const d = new Date(String(ts).replace(' ', 'T'));
      if (!isNaN(d.getTime()) && (max === null || d > max)) max = d;
    }
    return max;
  }, [processedData]);

  const renderItem = ({ item }) => (
    <ParkingCard data={item} now={now} />
  );

  useEffect(() => {
    debugLog('DashboardScreen: Realtime Data changed', Array.isArray(realtimeData) ? realtimeData.length : typeof realtimeData);
  }, [realtimeData]);

  return (
    <View className="flex-1 bg-bg-primary-light">
      <View className="p-3 border-b border-border-light bg-bg-card-light">
        <Text className="text-lg font-bold text-text-primary-light">Parking Dashboard</Text>
        <Text className="text-xs mt-1 text-text-secondary-light">{`Updated: ${formatTime(lastDataDate || now, 'pl-PL')}`}</Text>
      </View>

      {realtimeLoading && (
        <FlatList
          data={[1,2,3,4]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <LoadingSkeletonCard />}
        />
      )}

      {realtimeError && !realtimeLoading && (
        <View className="flex-1 items-center justify-center"> 
          <Text className="text-sm text-warning-light">Error loading data. Pull to retry.</Text>
        </View>
      )}

      {!realtimeLoading && !realtimeError && data.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-text-muted-light">No parking data available.</Text>
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
    </View>
  );
};

export default DashboardScreen;
