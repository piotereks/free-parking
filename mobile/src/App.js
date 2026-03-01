import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Text, View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Image, Linking, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParkingDataProvider from './context/ParkingDataProvider';
import { debugLog } from './config/debug';
import useParkingStore from './hooks/useParkingStore';
import useOrientation from './hooks/useOrientation';
import { applyApproximations, calculateDataAge, formatAgeLabel, formatTime, createRefreshHelper, getMaxCapacity } from 'parking-shared';
import pkg from '../package.json';
import StatisticsScreen from './screens/StatisticsScreen';

// Top-level app theme constant. Set to 'dark', 'light' or 'system'.
export const APP_THEME = 'dark';

// Lazy/guarded require so AdMob load failures don't crash the module.
let AdMobManager = null;
try {
  AdMobManager = require('../AdMobManager').default;
} catch (e) {
  console.warn('AdMobManager failed to load:', e && e.message ? e.message : e);
}

/** Returns a fill-bar colour based on the free-space percentage.
 *  ≥40% → green, 10–39% → orange, <10% → red, null → grey (offline/unknown) */
const getFreeBarColor = (pct) =>
  pct === null ? '#6b7280' : pct >= 40 ? '#22c55e' : pct >= 10 ? '#f97316' : '#ef4444';

/** Layout constants for computing tile bar widths */
const TILE_COLUMNS = 2;
const CONTAINER_H_PAD = 24; // px-3 = 12px * 2
const TILE_ROW_GAP = 8;
const TILE_INNER_PAD = 24; // p-3 = 12px * 2

/**
 * ParkingTile Component
 * Displays individual parking lot information
 * @param {boolean} [isLandscape=false] - Whether the device is in landscape orientation
 * @param {number} [tileValueFontSize=60] - Font size for the main free-space number; scaled down on smaller portrait screens
 */
function ParkingTile({ data, now, allOffline, isLandscape, tileValueFontSize = 60 }) {
  const age = calculateDataAge(data.Timestamp, now);
  const { display } = formatAgeLabel(age);
  
  // Determine color based on age - use ternary with complete static class strings
  const ageColorClass = allOffline 
    ? "text-muted dark:text-muted-dark"
    : age >= 15 
      ? "text-warning dark:text-warning-dark"
      : age > 5 
        ? "text-warning-medium dark:text-warning-medium-dark"
        : "text-success dark:text-success-dark";
  
  const value = data.approximationInfo?.isApproximated 
    ? data.approximationInfo.approximated 
    : (data.CurrentFreeGroupCounterValue || 0);

  const capacity = getMaxCapacity(data.ParkingGroupName) || null;
  const freePercent = capacity > 0 ? Math.min(100, Math.round((value / capacity) * 100)) : null;
  const barColor = getFreeBarColor(freePercent);

  const displayName = data.ParkingGroupName === 'Bank_1' ? 'Uni Wroc' : data.ParkingGroupName;

  if (isLandscape) {
    // Compact row-oriented tile for landscape:
    //   Name
    //   [≈ value (2/3)]  |  [orig: X or blank (1/3)]
    //                    |  [age                    ]
    const origValue = data.approximationInfo?.isApproximated
      ? (data.approximationInfo?.original ?? data.CurrentFreeGroupCounterValue ?? 0)
      : null;
    return (
      <View className="flex-1 rounded-lg border border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark" style={{ padding: 8 }}>
        <Text className="font-semibold text-foreground dark:text-foreground-dark mb-1" numberOfLines={1} style={{ fontSize: 21 }}>
          {displayName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
          {/* Left: value — 2/3 width */}
          <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              {data.approximationInfo?.isApproximated && (
                <Text className="text-2xl text-warning-medium dark:text-warning-medium-dark" style={{ marginRight: 2, fontSize: 28 }}>≈</Text>
              )}
              <Text className={`font-bold ${ageColorClass}`} style={{ fontSize: 82 }}>{value}</Text>
            </View>
          </View>
          {/* Right: orig (or blank placeholder for alignment) + age — 1/3 width */}
          <View style={{ flex: 1, paddingLeft: 6, borderLeftWidth: 1, borderLeftColor: 'rgba(128,128,128,0.3)', justifyContent: 'center' }}>
            <Text className="text-xs text-muted dark:text-muted-dark" numberOfLines={1}>
              {origValue !== null ? `orig: ${origValue}` : ' '}
            </Text>
            <Text className={`text-xs ${ageColorClass}`}>{display}</Text>
            {freePercent !== null && (
              <>
                <View style={{ height: 4, backgroundColor: 'rgba(128,128,128,0.25)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                  <View style={{ height: '100%', width: `${freePercent}%`, borderRadius: 2, backgroundColor: barColor }} />
                </View>
                <Text className="text-xs text-muted dark:text-muted-dark" style={{ marginTop: 1 }}>{freePercent}% free</Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 mb-2 rounded-lg p-3 border border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark">
      <Text className="text-base font-semibold text-center text-foreground dark:text-foreground-dark mb-2">
        {displayName}
      </Text>
      
      <View className="flex-row items-center justify-center">
        {data.approximationInfo?.isApproximated && (
          <Text className="text-warning-medium dark:text-warning-medium-dark mr-1" style={{ fontSize: tileValueFontSize }}>≈</Text>
        )}
        <Text className={`font-bold text-center ${ageColorClass}`} style={{ fontSize: tileValueFontSize }}>
          {value}
        </Text>
      </View>
      
      {data.approximationInfo?.isApproximated ? (
        <Text className="text-sm text-muted dark:text-muted-dark text-center mt-1">
          (orig: {data.approximationInfo?.original ?? data.CurrentFreeGroupCounterValue ?? 0})
        </Text>
      ) : (
        <Text className="text-sm text-muted dark:text-muted-dark text-center mt-1">{' '}</Text>
      )}
      
      <Text className="text-sm text-muted dark:text-muted-dark text-center mt-2">
        {display}
      </Text>
      {freePercent !== null && (
        <>
          <View style={{ height: 6, backgroundColor: 'rgba(128,128,128,0.25)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
            <View style={{ height: '100%', width: `${freePercent}%`, borderRadius: 3, backgroundColor: barColor }} />
          </View>
          <Text className="text-xs text-muted dark:text-muted-dark text-center" style={{ marginTop: 2 }}>{freePercent}% free</Text>
        </>
      )}
    </View>
  );
}

/**
 * DashboardContent Component
 * Main dashboard displaying parking data
 */
function DashboardContent({ setView }) {
  const { isDark, setTheme } = useTheme();
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const title = 'Parking Monitor';
  const version = pkg?.version || '0.0.0';

  // Scale tile value font size for smaller devices to avoid scrolling in portrait
  const tileValueFontSize = Math.min(60, Math.max(32, Math.round(screenHeight * 0.08)));
  
  // helper to toggle
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const openDonate = () => Linking.openURL('https://buycoffee.to/piotereks');
  
  // Store state
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);

  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = global.setInterval(() => setNow(new Date()), 1000);
    return () => global.clearInterval(timer);
  }, []);

  // Apply approximations to data
  const processed = useMemo(() => {
    return applyApproximations(realtimeData, now);
  }, [realtimeData, now]);

  // Create refresh helper
  const refreshHelper = useMemo(() => {
    return createRefreshHelper(useParkingStore);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      debugLog('onRefresh: start user-initiated refresh');
      await refreshHelper();
      debugLog('onRefresh: refreshHelper resolved');
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshHelper]);

  // Check if all feeds are offline
  const allOffline = processed.length > 0 && processed.every((d) => {
    const age = calculateDataAge(d.Timestamp, now);
    return age >= 1440;
  });

  // Check if any data is approximated
  const hasApproximation = processed.some(d => d.approximationInfo?.isApproximated);

  // Calculate totals
  const totalSpaces = processed.reduce((sum, d) => {
    const info = d.approximationInfo || {};
    const value = info.isApproximated ? info.approximated : (d.CurrentFreeGroupCounterValue || 0);
    return sum + value;
  }, 0);

  const originalTotal = processed.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);

  const totalCapacity = processed.reduce((sum, d) => sum + (getMaxCapacity(d.ParkingGroupName) || 0), 0);
  const totalFreePercent = totalCapacity > 0 ? Math.min(100, Math.round((totalSpaces / totalCapacity) * 100)) : null;

  // Determine aggregated status
  const getAggregatedStatus = () => {
    if (processed.length === 0) {
      return { 
        colorClass: "text-muted dark:text-muted-dark", 
        statusMessage: 'No data available' 
      };
    }

    const maxAge = Math.max(...processed.map(d => calculateDataAge(d.Timestamp, now)));
    
    if (allOffline) {
      return {
        colorClass: "text-warning dark:text-warning-dark",
        statusMessage: 'All parking feeds appear offline'
      };
    } else if (maxAge >= 15) {
      return {
        colorClass: "text-warning dark:text-warning-dark",
        statusMessage: 'Data outdated - figures may not reflect actual free spaces'
      };
    } else if (maxAge > 5) {
      return {
        colorClass: "text-warning-medium dark:text-warning-medium-dark",
        statusMessage: 'Data slightly outdated - refresh recommended'
      };
    } else {
      return {
        colorClass: "text-success dark:text-success-dark",
        statusMessage: 'Data is current and reliable'
      };
    }
  };

  const { colorClass: statusColorClass, statusMessage } = getAggregatedStatus();
  const totalColorClass = statusColorClass;
  const summaryBarColor = getFreeBarColor(totalFreePercent);

  // Debug logging for orientation and version
  useEffect(() => {
    debugLog('DashboardContent: Orientation changed', orientation, 'Version:', version);
  }, [orientation, version]);

  return (
    <SafeAreaView className={`flex-1 bg-primary dark:bg-primary-dark ${isDark ? 'dark' : ''}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />

      {/* Full-width header — portrait only */}
      {!isLandscape && (
        <View className="w-full bg-secondary dark:bg-secondary-dark py-3 px-4 border-b border-border dark:border-border-dark">
          <View className="flex-row items-center justify-between mb-1">
            <Image 
              source={require('../assets/favicon.png')} 
              style={{ width: 36, height: 36, marginRight: 12 }} 
            />
            <View className="flex-1">
              <Text className="text-foreground dark:text-foreground-dark text-lg font-semibold">
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark shadow-custom-light dark:shadow-custom-dark"
              style={{ width: 44, height: 44 }}
            >
              <Text className="text-2xl">
                {isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView('stats')}
              accessibilityRole="button"
              accessibilityLabel="View parking statistics"
              className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
              style={{ width: 44, height: 44, marginLeft: 8 }}
              testID="open-statistics-button"
            >
              <Text className="text-2xl">📈</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openDonate}
              accessibilityRole="link"
              accessibilityLabel="Buy me a coffee — support development"
              className="flex-row items-center justify-center rounded-lg border border-border dark:border-border-dark"
              style={{ height: 44, paddingHorizontal: 10, marginLeft: 8, backgroundColor: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.20)' }}
            >
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark" style={{ marginRight: 4 }}>Buy me</Text>
              <Text style={{ fontSize: 22 }}>☕</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-muted dark:text-muted-dark text-xs" style={{ marginLeft: 48 }}>
            Version: {version}
          </Text>
        </View>
      )}

      {/* Floating Real-time label — portrait only */}
      {!isLandscape && !realtimeLoading && !realtimeError && (
        <View className="w-full items-center py-1 bg-primary dark:bg-primary-dark">
          <Text className="text-muted dark:text-muted-dark text-sm">
            Real-time • GD-Uni Wrocław
          </Text>
        </View>
      )}

      {/* Loading State */}
      {realtimeLoading && processed.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted dark:text-muted-dark text-lg">
            Loading parking data...
          </Text>
        </View>
      ) : realtimeError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-warning dark:text-warning-dark text-base text-center">
            {String(realtimeError)}
          </Text>
        </View>
      ) : isLandscape ? (
        /* ── LANDSCAPE: header column + tiles on same row ── */
        <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 6 }}>
          {/* Row: narrow header column on the left, tiles on the right */}
          <View style={{ flexDirection: 'row', gap: 8, flex: 1, marginBottom: 8 }}>
            {/* Header column */}
            <View
              className="rounded-lg bg-secondary dark:bg-secondary-dark border border-border dark:border-border-dark"
              style={{ width: Math.floor(screenWidth * 0.25), maxWidth: 200, padding: 8, justifyContent: 'space-between', alignItems: 'center' }}
            >
              {/* Logo + title on same row */}
              <View style={{ alignItems: 'center', gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Image
                    source={require('../assets/favicon.png')}
                    style={{ width: 24, height: 24, flexShrink: 0 }}
                  />
                  <Text className="text-foreground dark:text-foreground-dark font-semibold" numberOfLines={2} style={{ flexShrink: 1, fontSize: 18 }}>
                    {title}
                  </Text>
                </View>
                <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 12 }} numberOfLines={1}>
                  Version: {version}
                </Text>
                <Text className="text-muted dark:text-muted-dark" style={{ fontSize: screenHeight < 400 ? 11 : 14 }} numberOfLines={2}>
                  Real-time • GD-Uni Wrocław
                </Text>
              </View>
              <View style={{ gap: 6, alignItems: 'center' }}>
                {/* Theme toggle + Reload on the same row */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    accessibilityRole="button"
                    accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                  >
                    <Text className="text-xl">
                      {isDark ? '☀️' : '🌙'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onRefresh}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh data"
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                  >
                    {refreshing || realtimeLoading ? (
                      <ActivityIndicator size="small" color={isDark ? '#e0e6ff' : '#333333'} />
                    ) : (
                      <Text
                        accessibilityRole="image"
                        accessibilityLabel="Refresh icon"
                        className="text-xl text-foreground dark:text-foreground-dark"
                      >
                        ⟳
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setView('stats')}
                    accessibilityRole="button"
                    accessibilityLabel="View parking statistics"
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                    testID="open-statistics-button-landscape"
                  >
                    <Text className="text-xl">📈</Text>
                  </TouchableOpacity>
                </View>
                {/* Buy me ☕ on its own row below */}
                <TouchableOpacity
                  onPress={openDonate}
                  accessibilityRole="link"
                  accessibilityLabel="Buy me a coffee — support development"
                  className="flex-row items-center justify-center rounded-lg border border-border dark:border-border-dark"
                  style={{ height: 36, paddingHorizontal: 6, backgroundColor: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.20)' }}
                >
                  <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark" style={{ marginRight: 2 }}>Buy me</Text>
                  <Text style={{ fontSize: 18 }}>☕</Text>
                </TouchableOpacity>
              </View>
            </View>

          {/* Tiles — hidden on very short landscape screens to prevent overflow */}
          {screenHeight >= 360 && processed.map((d, i) => (
              <ParkingTile
                key={d.ParkingGroupName || i}
                data={d}
                now={now}
                allOffline={allOffline}
                isLandscape
              />
            ))}
          </View>

          {/* Status message — between tiles and summary card */}
          <Text className={`text-xs font-semibold text-center my-1 ${statusColorClass}`}>
            {statusMessage}
          </Text>

          {/* Summary card — horizontal */}
          <View
            className="rounded-lg bg-secondary dark:bg-secondary-dark border border-border dark:border-border-dark overflow-hidden"
            style={{ flexDirection: 'row' }}
          >
            {/* Total Spaces */}
            <View
              className="p-2 items-center justify-center border-border dark:border-border-dark"
              style={{ flex: 1, borderRightWidth: 1 }}
            >
              <Text className="text-xs text-muted dark:text-muted-dark">Total</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                {hasApproximation && (
                  <Text className="text-xl text-warning-medium dark:text-warning-medium-dark" style={{ marginRight: 2 }}>≈</Text>
                )}
                <Text className={`text-2xl font-bold ${totalColorClass}`}>{totalSpaces}</Text>
                {hasApproximation && (
                  <Text className="text-xs text-muted dark:text-muted-dark italic" style={{ marginLeft: 4 }}>(orig: {originalTotal})</Text>
                )}
              </View>
              {totalFreePercent !== null && (
                <View style={{ width: '100%', marginTop: 4 }}>
                  <View style={{ height: 5, backgroundColor: 'rgba(128,128,128,0.25)', borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${totalFreePercent}%`, borderRadius: 2, backgroundColor: summaryBarColor }} />
                  </View>
                  <Text className="text-xs text-muted dark:text-muted-dark text-center" style={{ marginTop: 1 }}>{totalFreePercent}% free</Text>
                </View>
              )}
            </View>

            {/* Last Update */}
            <View
              className="p-2 items-center justify-center border-border dark:border-border-dark"
              style={{ flex: 2, borderRightWidth: 1 }}
            >
              <Text className="text-xs text-muted dark:text-muted-dark">Last Update / Current</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <Text className="text-sm font-bold text-foreground dark:text-foreground-dark">
                  {lastRealtimeUpdate ? formatTime(lastRealtimeUpdate, 'pl-PL') : '--:--:--'}
                </Text>
                <Text className="text-xs text-muted dark:text-muted-dark">
                  {now.toLocaleTimeString('pl-PL')}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className="p-2 items-center justify-center" style={{ flex: 1 }}>
              <Text className="text-xs text-muted dark:text-muted-dark">Status</Text>
              <Text className={`text-base font-bold mt-0.5 ${hasApproximation
                ? 'text-warning-medium dark:text-warning-medium-dark'
                : 'text-success dark:text-success-dark'}`}
              >
                {hasApproximation ? 'APPROX' : 'ONLINE'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* ── PORTRAIT: scrollable layout ── */
        <ScrollView
          className="flex-1 px-3"
          style={{ paddingTop: 4, paddingBottom: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Parking Tiles */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 4 }}>
            {processed.map((d, i) => (
              <ParkingTile 
                key={d.ParkingGroupName || i} 
                data={d} 
                now={now} 
                allOffline={allOffline}
                tileValueFontSize={tileValueFontSize}
              />
            ))}
          </View>

          {/* Status Message */}
          <View className="mb-2">
            <Text className={`text-sm font-semibold text-center ${statusColorClass}`}>
              {statusMessage}
            </Text>
          </View>

          {/* Summary Card */}
          <View className="rounded-lg bg-secondary dark:bg-secondary-dark border border-border dark:border-border-dark overflow-hidden">
            {/* Total Spaces */}
            <View className="p-3 items-center border-b border-border dark:border-border-dark">
              <Text className="text-xs text-muted dark:text-muted-dark">
                Total Spaces
              </Text>
              <View className="items-center mt-1">
                <View className="flex-row items-baseline">
                  {hasApproximation && (
                    <Text className="text-3xl text-warning-medium dark:text-warning-medium-dark mr-1">
                      ≈
                    </Text>
                  )}
                  <Text className={`text-3xl font-bold ${totalColorClass}`}>
                    {totalSpaces}
                  </Text>
                </View>
                {hasApproximation && (
                  <Text className="text-xs text-muted dark:text-muted-dark italic">
                    (orig: {originalTotal})
                  </Text>
                )}
                {totalFreePercent !== null && (
                  <View style={{ width: Math.max(80, Math.floor((screenWidth - CONTAINER_H_PAD - TILE_ROW_GAP) / TILE_COLUMNS) - TILE_INNER_PAD), marginTop: 8, alignSelf: 'center' }}>
                    <View style={{ height: 6, backgroundColor: 'rgba(128,128,128,0.25)', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${totalFreePercent}%`, borderRadius: 3, backgroundColor: summaryBarColor }} />
                    </View>
                    <Text className="text-xs text-muted dark:text-muted-dark text-center" style={{ marginTop: 2 }}>{totalFreePercent}% free</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Update Time & Refresh Button */}
            <View className="p-3 border-b border-border dark:border-border-dark flex-row items-center justify-center gap-2">
              <View className="items-center">
                <Text className="text-xs text-muted dark:text-muted-dark mb-1 text-center">
                  Last Update / Current
                </Text>
                <View className="flex-row items-baseline gap-2 justify-center py-1">
                  <Text className="text-base font-bold text-foreground dark:text-foreground-dark text-center">
                    {lastRealtimeUpdate ? formatTime(lastRealtimeUpdate, 'pl-PL') : '--:--:--'}
                  </Text>
                  <Text className="text-sm text-muted dark:text-muted-dark text-center">
                    {now.toLocaleTimeString('pl-PL')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={onRefresh} 
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Refresh data"
                style={{ alignSelf: 'center', justifyContent: 'center' }}
              >
                <View className="px-3 py-2 rounded-md border border-border dark:border-border-dark bg-primary dark:bg-primary-dark flex-row items-center">
                  {refreshing || realtimeLoading ? (
                    <>
                      <ActivityIndicator 
                        size="small" 
                        color={isDark ? '#e0e6ff' : '#333333'} 
                      />
                      <Text className="ml-2 text-foreground dark:text-foreground-dark">
                        Refreshing
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text 
                        accessibilityRole="image" 
                        accessibilityLabel="Refresh icon"
                        className="mr-2 text-foreground dark:text-foreground-dark"
                      >
                        ⟳
                      </Text>
                      <Text className="text-foreground dark:text-foreground-dark">
                        Refresh
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View className="p-3 items-center">
              <Text className="text-xs text-muted dark:text-muted-dark mb-1">
                Status
              </Text>
              <Text className={`text-xl font-bold ${hasApproximation 
                ? 'text-warning-medium dark:text-warning-medium-dark' 
                : 'text-success dark:text-success-dark'}`}
              >
                {hasApproximation ? 'APPROX' : 'ONLINE'}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Ad Banner — inside themed SafeAreaView so its background matches the app */}
      {AdMobManager && (
        <View className="items-center bg-primary dark:bg-primary-dark">
          <AdMobManager />
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * AppContent Component
 * Wrapper for dashboard and statistics navigation
 */
const AppContent = () => {
  const [view, setView] = useState('dashboard');

  if (view === 'stats') {
    return <StatisticsScreen onBack={() => setView('dashboard')} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <DashboardContent setView={setView} />
    </View>
  );
};

/**
 * App Component
 * Root component with providers
 * 
 * Change APP_THEME constant above to switch between 'light', 'dark', or 'system'
 */
export default function App() {
  return (
    <ThemeProvider initialMode={APP_THEME}>
      <ParkingDataProvider>
        <AppContent />
        {/* demo removed */}
      </ParkingDataProvider>
    </ThemeProvider>
  );
}