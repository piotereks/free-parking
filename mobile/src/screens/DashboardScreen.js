/* global setInterval, clearInterval */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';
import { applyApproximations, isValidParkingData, normalizeParkingName, calculateDataAge, formatAgeLabel, formatTime } from 'parking-shared';
import ParkingCard from '../components/ParkingCard';
import LoadingSkeletonCard from '../components/LoadingSkeletonCard';

const DashboardScreen = () => {
  const { colors, isDark } = useTheme();
  const [now, setNow] = useState(() => new Date());

  // Debug: Log theme colors
  useEffect(() => {
    console.log('Theme applied:', { isDark, background: colors.background, text: colors.text });
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

  const renderItem = ({ item }) => (
    <ParkingCard data={item} now={now} />
  );

  useEffect(() => {
    console.log('Realtime Data:', realtimeData);
  }, [realtimeData]);

  return (
    <View className="flex-1 bg-bg-primary-light dark:bg-bg-primary-dark">
      <View className="p-3 border-b border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-card-dark">
        <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Parking Dashboard</Text>
        <Text className="text-xs mt-1 text-text-secondary-light dark:text-text-secondary-dark">{`Updated: ${formatTime(now, 'pl-PL')}`}</Text>
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
          <Text className="text-sm text-warning-light dark:text-warning-dark">Error loading data. Pull to retry.</Text>
        </View>
      )}

      {!realtimeLoading && !realtimeError && data.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-text-muted-light dark:text-text-muted-dark">No parking data available.</Text>
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
