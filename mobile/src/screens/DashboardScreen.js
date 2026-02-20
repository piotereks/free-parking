/* global setInterval, clearInterval */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';
import { applyApproximations, isValidParkingData, normalizeParkingName, calculateDataAge, formatAgeLabel, formatTime } from 'parking-shared';
import { debugLog } from '../config/debug';
import ParkingCard from '../components/ParkingCard';
import LoadingSkeletonCard from '../components/LoadingSkeletonCard';

/**
 * DashboardScreen Component
 * Alternative dashboard view showing parking data in a list
 */
const DashboardScreen = () => {
  const { isDark } = useTheme();
  const [now, setNow] = useState(() => new Date());

  const realtimeData = useParkingStore((s) => s.realtimeData);
  const realtimeLoading = useParkingStore((s) => s.realtimeLoading);
  const realtimeError = useParkingStore((s) => s.realtimeError);
  const refreshCallback = useParkingStore((s) => s.refreshCallback);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger refresh on mount
  useEffect(() => {
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
    void doRefresh();
  }, [refreshCallback]);

  // Handle user-initiated refresh
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

  // Apply approximations and validate data
  const processedData = useMemo(() => {
    try {
      const approxed = Array.isArray(data) ? applyApproximations(data, now) : [];
      const validData = Array.isArray(approxed) ? approxed.filter(isValidParkingData) : [];

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

  // Calculate most recent data timestamp
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
    <View className="bg-primary dark:bg-primary-dark flex-1">
      {/* Header */}
      <View className="p-3 border-b border-border dark:border-border-dark bg-card dark:bg-card-dark">
        <Text className="text-foreground dark:text-foreground-dark text-lg font-bold">
          Parking Dashboard
        </Text>
        <Text className="text-muted dark:text-muted-dark text-xs mt-1">
          Updated: {formatTime(lastDataDate || now, 'pl-PL')}
        </Text>
      </View>

      {/* Loading State */}
      {realtimeLoading && (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <LoadingSkeletonCard />}
        />
      )}

      {/* Error State */}
      {realtimeError && !realtimeLoading && (
        <View className="flex-1 items-center justify-center"> 
          <Text className="text-warning dark:text-warning-dark text-sm">
            Error loading data. Pull to retry.
          </Text>
        </View>
      )}

      {/* Empty State */}
      {!realtimeLoading && !realtimeError && data.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted dark:text-muted-dark text-sm">
            No parking data available.
          </Text>
        </View>
      )}

      {/* Data List */}
      {!realtimeLoading && processedData.length > 0 && (
        <FlatList
          data={processedData}
          keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={realtimeLoading} 
              onRefresh={onRefresh} 
            />
          }
        />
      )}
    </View>
  );
};

export default DashboardScreen;