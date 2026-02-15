import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { APP_THEME } from '../App';
import { Text, View, StatusBar, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { ThemeProvider} from './context/ThemeContext';
import { buildColorMaps } from './utils/colorMaps';
import { logStyleUsage } from './utils/allStylesLogger';
import ParkingDataProvider from './context/ParkingDataProvider';
import { debugLog } from './config/debug';
import useParkingStore from './hooks/useParkingStore';
import { applyApproximations, calculateDataAge, formatAgeLabel, parseTimestamp, formatTime, createRefreshHelper } from 'parking-shared';

export const APP_THEME = 'dark'; // 'light', 'dark', or 'auto' (system)

export const { allStyles, colorScheme, isDark }  = buildColorMaps(APP_THEME);

// Debug log common style keys used in this file
['bg-primary','bg-secondary','border','text-primary','text-secondary','text-warning','text-warning-medium','text-success','bg-container','text-example'].forEach(k => {
  logStyleUsage('App', allStyles, k, k.startsWith('bg') ? 'bg-' : (k.startsWith('text') ? 'text-' : ''));
});

const SSafeArea = styled(SafeAreaView);
const SView = styled(View);
const SText = styled(Text);
const SScroll = styled(ScrollView);


function ParkingTile(d, i, now, allOffline) {
  return <SView key={d.ParkingGroupName || i} className={`flex-1 rounded-lg p-3 ${allStyles['border']} ${allStyles['bg-secondary']}`}>
    <SText className={`${allStyles['text-primary']} text-base font-semibold text-center mb-2`}>
      {d.ParkingGroupName === 'Bank_1' ? 'Uni Wroc' : d.ParkingGroupName}
    </SText>
    {(() => {
      const age = calculateDataAge(d.Timestamp, now);
      const colorClass = allOffline ? `${allStyles['text-secondary']}` : (age >= 15 ? `${allStyles['text-warning']}` : (age > 5 ? `${allStyles['text-warning-medium']}` : `${allStyles['text-success']}`));
      const value = d.approximationInfo?.isApproximated ? d.approximationInfo.approximated : (d.CurrentFreeGroupCounterValue || 0);
      return (
        <SView className="flex-row items-center justify-center">
          {d.approximationInfo?.isApproximated && <SText className={`${allStyles['text-warning-medium']} text-6xl mr-1`}>≈</SText>}
          <SText className={`text-6xl font-bold text-center ${colorClass}`}>{value}</SText>
        </SView>
      );
    })()}
    {d.approximationInfo?.isApproximated && (
      <SText className={`${allStyles['text-secondary']} text-sm text-center mt-1`}>(orxig: {d.approximationInfo?.original ?? d.CurrentFreeGroupCounterValue ?? 0})</SText>
    )}
    <SText className={`${allStyles['text-secondary']} text-sm text-center mt-2`}>
      {(() => {
        const age = calculateDataAge(d.Timestamp, now);
        const { display } = formatAgeLabel(age);
        return display;
      })()}
    </SText>
  </SView>;
}


function DashboardContent() {

  const title = 'Parking Monitor';
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);

  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = global.setInterval(() => setNow(new Date()), 1000);
    return () => global.clearInterval(timer);
  }, []);

  const processed = useMemo(() => {
    return applyApproximations(realtimeData, now);
  }, [realtimeData, now]);

  // refresh helper calls the fetch callback wired by ParkingDataProvider
  const refreshHelper = useMemo(() => {
    const base = createRefreshHelper(useParkingStore);
    return async () => {
      debugLog('refreshHelper: invoked');
      await base();
      debugLog('refreshHelper: completed');
    };
  }, []);

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

  const allOffline = processed.length > 0 && processed.every((d) => {
    const age = calculateDataAge(d.Timestamp, now);
    return age >= 1440;
  });

  const hasApproximation = processed.some(d => d.approximationInfo?.isApproximated);

  const totalSpaces = processed.reduce((sum, d) => {
    const info = d.approximationInfo || {};
    const value = info.isApproximated ? info.approximated : (d.CurrentFreeGroupCounterValue || 0);
    return sum + value;
  }, 0);

  const originalTotal = processed.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);

  const getAggregatedStatus = () => {
    if (processed.length === 0) {
      return { colorClass: '', statusMessage: 'No data available' };
    }

    let maxAge = 0;
    processed.forEach((d) => {
      const age = calculateDataAge(d.Timestamp, now);
      maxAge = Math.max(maxAge, age);
    });

    let colorClass = '';
    let statusMessage = '';

    if (allOffline) {
      colorClass = `text-${allStyles['text-warning']}`;
      statusMessage = 'All parking feeds appear offline';
    } else if (maxAge >= 15) {
      colorClass = `text-${allStyles['text-warning']}`;
      statusMessage = 'Data outdated - figures may not reflect actual free spaces';
    } else if (maxAge > 5) {
      colorClass = `text-${allStyles['text-warning-medium']}`;
      statusMessage = 'Data slightly outdated - refresh recommended';
    } else {
      colorClass = `text-${allStyles['text-success']}`;
      statusMessage = 'Data is current and reliable';
    }

    return { colorClass, statusMessage };
  };

  const { colorClass: totalColorClass, statusMessage } = getAggregatedStatus();

  useEffect(() => {
    // Log only when processed content or totals change (not every tick)
    try {
      debugLog('[Parking] Processed items:', processed.length);
      processed.forEach((d, idx) => {
        const name = d?.ParkingGroupName || `<unknown-${idx}>`;
        const age = calculateDataAge(d?.Timestamp); // uses current time internally
        const approx = d?.approximationInfo || {};
        debugLog(`[Parking] ${name}: ts=${d?.Timestamp} age=${age}m isApproximated=${!!approx.isApproximated} original=${approx.original ?? d?.CurrentFreeGroupCounterValue ?? 0} approximated=${approx.approximated ?? d?.CurrentFreeGroupCounterValue ?? 0}`);
      });

      debugLog('[Parking] Totals:', { totalSpaces, originalTotal });

      let maxAgeForLog = 0;
      processed.forEach((d) => {
        const a = calculateDataAge(d?.Timestamp);
        if (a > maxAgeForLog) maxAgeForLog = a;
      });
      debugLog('[Parking] Max age (min):', maxAgeForLog, 'All offline:', allOffline);
    } catch (e) {
      console.error('[Parking] debug logging failed', e);
    }
  }, [processed, totalSpaces, originalTotal, lastRealtimeUpdate]);

  return (
    <SSafeArea className={`flex-1 bg-${allStyles['bg-primary']} ${colorScheme === 'dark' ? 'dark' : ''}`}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <SView className={`w-full bg-${allStyles['bg-secondary']} flex-row items-center justify-center py-3 px-4 border-b border-${allStyles['border']}`}>
        <Image source={require('../assets/favicon.png')} style={{ width: 36, height: 36, marginRight: 12 }} />
        <SView className="items-center">
          <SText className={`text-${allStyles['text-primary']} text-lg font-semibold`}>{title}</SText>
          <SText className={`text-${allStyles['text-secondary']} text-xs mt-0.5`}>Real-time • GD-Uni Wrocław</SText>
        </SView>
      </SView>

      {realtimeLoading && processed.length === 0 ? (
        <SView className="flex-1 items-center justify-center">
          <SText className={`text-${allStyles['text-secondary']} text-lg`}>Loading parking data...</SText>
        </SView>
      ) : realtimeError ? (
        <SView className="flex-1 items-center justify-center px-4">
          <SText className={`text-${allStyles['text-warning']} text-base text-center`}>{String(realtimeError)}</SText>
        </SView>
      ) : (
        <SScroll
          className="flex-1 px-3 py-2"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <SView className="flex-row gap-2 mb-3">
            {processed.map((d, i) => (
              ParkingTile(d, i, now, allOffline)
              // <ParkingCard key={d?.ParkingGroupName || i} {...d} now={now} allOffline={allOffline} />
            ))}
          </SView>

          <SView className="mb-2">
            <SText className={`text-sm font-semibold text-center ${totalColorClass}`}>
              {statusMessage}
            </SText>
          </SView>

          <SView className={`rounded-lg bg-${allStyles['bg-secondary']} border border-${allStyles['border']} overflow-hidden`}>
            <SView className={`p-3 items-center border-b border-${allStyles['border']}`}>
              <SText className={`text-xs text-${allStyles['text-secondary']}`}>Total Spaces</SText>
              <SView className="flex-row items-baseline mt-1">
                {hasApproximation && <SText className={`text-3xl text-${allStyles['text-warning-medium']} mr-1`}>≈</SText>}
                <SText className={`text-3xl font-bold ${totalColorClass}`}>{totalSpaces}</SText>
              </SView>
              {hasApproximation && (
                <SText className={`text-xs text-${allStyles['text-secondary']} italic`}>
                  (oryig: {originalTotal})
                </SText>
              )}
            </SView>

              <SView className={`p-3 border-b border-${allStyles['border']} flex-row items-center justify-center gap-2`}>
              <SView className="items-center">
                <SText className={`text-xs text-${allStyles['text-secondary']} mb-1 text-center`}>Last Update / Current</SText>
                <SView className="flex-row items-baseline gap-2 justify-center py-1">
                  <SText className={`text-base font-bold text-${allStyles['text-primary']} text-center`}>
                    {lastRealtimeUpdate ? formatTime(lastRealtimeUpdate, 'pl-PL') : '--:--:--'}
                  </SText>
                  <SText className={`text-sm text-${allStyles['text-secondary']} text-center`}>
                    {now.toLocaleTimeString('pl-PL')}
                  </SText>
                </SView>
              </SView>

              <TouchableOpacity onPress={onRefresh} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Refresh data" style={{ alignSelf: 'center', justifyContent: 'center' }}>
                <SView className={`nav-btn px-3 py-2 rounded-md border border-${allStyles['border']} bg-${allStyles['bg-primary']} flex-row items-center`}>
                  {refreshing || realtimeLoading ? (
                    <>
                      <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#e0e6ff' : '#333333'} />
                      <SText className={`btn-text ml-2 text-${allStyles['text-primary']}`}>Refreshing</SText>
                    </>
                  ) : (
                    <>
                      <SText accessibilityRole="image" accessibilityLabel="Refresh icon" className={`btn-icon mr-2 text-${allStyles['text-primary']}`}>⟳</SText>
                      <SText className={`btn-text text-${allStyles['text-primary']}`}>Refresh</SText>
                    </>
                  )}
                </SView>
              </TouchableOpacity>
            </SView>

            <SView className="p-3 items-center">
              <SText className={`text-xs text-${allStyles['text-secondary']} mb-1`}>Status</SText>
              <SText className={`text-xl font-bold ${hasApproximation ? `text-${allStyles['text-warning-medium']}` : `text-${allStyles['text-success']}`}`}>
                {hasApproximation ? 'APPROX' : 'ONLINE'}
              </SText>
            </SView>
          </SView>
        </SScroll>
      )}
    </SSafeArea>
  );
}

const AppContent = () => {
  return (
    <View style={{ flex: 1 }}>
      <DashboardContent />
    </View>
  );
};


// Top-level app theme constant. Set to 'dark', 'light' or 'auto'.
// Change this value to control the initial theme used by the app.

export default function App() {
  return (
    <ThemeProvider initialMode={APP_THEME}>
      <ParkingDataProvider>
        <AppContent />
      </ParkingDataProvider>
    </ThemeProvider>
  );
}
