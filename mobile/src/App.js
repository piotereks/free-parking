import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParkingDataProvider from './context/ParkingDataProvider';
import useParkingStore from './hooks/useParkingStore';
import { applyApproximations, calculateDataAge, formatAgeLabel } from 'parking-shared';

const SSafeArea = styled(SafeAreaView);
const SView = styled(View);
const SText = styled(Text);

function ParkingCard({ data, now, allOffline }) {
  let name = data.ParkingGroupName;
  if (name === 'Bank_1') name = 'Uni Wroc';

  const approximationInfo = data.approximationInfo || {};
  const isApproximated = Boolean(approximationInfo.isApproximated);
  const freeSpots = isApproximated ? approximationInfo.approximated : (data.CurrentFreeGroupCounterValue || 0);
  const originalSpots = approximationInfo.original ?? data.CurrentFreeGroupCounterValue ?? 0;

  const ts = data.Timestamp ? new Date(data.Timestamp.replace(' ', 'T')) : null;
  const age = ts ? Math.max(0, Math.floor((now - ts) / 1000 / 60)) : Infinity;
  const ageLabel = formatAgeLabel(age);

  // Color is based on age/allOffline only; approximation no longer affects color
  let ageClass = '';
  if (allOffline) ageClass = 'text-text-secondary-dark';
  else if (age >= 15) ageClass = 'text-warning-dark';
  else if (age > 5) ageClass = 'text-amber-600';

  return (
    <SView className="rounded-xl p-4 mb-3 flex flex-col items-center justify-center border border-border-dark bg-bg-secondary-dark shadow-lg">
      <SText className="text-base font-semibold mb-1 text-center text-text-primary-dark">{name}</SText>
      <SView className="flex-row items-center justify-center">
        {isApproximated && <SText className="text-4xl text-amber-600 mr-1">≈</SText>}
        <SText className={`text-4xl font-bold ${ageClass || 'text-success-dark'}`}>{freeSpots}</SText>
      </SView>
      {isApproximated && (
        <SText className="text-sm text-text-secondary-dark">(orig: {originalSpots})</SText>
      )}
      <SText className="text-sm text-text-secondary-dark mt-2">{ageLabel.display || ageLabel}</SText>
    </SView>
  );
}

function DashboardContent() {
  const title = 'Parking Monitor';
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = global.setInterval(() => setNow(new Date()), 1000);
    return () => global.clearInterval(timer);
  }, []);

  const processed = useMemo(() => {
    return applyApproximations(realtimeData, now);
  }, [realtimeData, now]);

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
      colorClass = 'text-warning-dark';
      statusMessage = 'All parking feeds appear offline';
    } else if (maxAge >= 15) {
      colorClass = 'text-warning-dark';
      statusMessage = 'Data outdated - figures may not reflect actual free spaces';
    } else if (maxAge > 5) {
      colorClass = 'text-amber-600';
      statusMessage = 'Data slightly outdated - refresh recommended';
    } else {
      colorClass = 'text-success-dark';
      statusMessage = 'Data is current and reliable';
    }

    return { colorClass, statusMessage };
  };

  const { colorClass: totalColorClass, statusMessage } = getAggregatedStatus();

  useEffect(() => {
    // Log only when processed content or totals change (not every tick)
    try {
      console.debug('[Parking] Processed items:', processed.length);
      processed.forEach((d, idx) => {
        const name = d?.ParkingGroupName || `<unknown-${idx}>`;
        const age = calculateDataAge(d?.Timestamp); // uses current time internally
        const approx = d?.approximationInfo || {};
        console.debug(`[Parking] ${name}: ts=${d?.Timestamp} age=${age}m isApproximated=${!!approx.isApproximated} original=${approx.original ?? d?.CurrentFreeGroupCounterValue ?? 0} approximated=${approx.approximated ?? d?.CurrentFreeGroupCounterValue ?? 0}`);
      });

      console.debug('[Parking] Totals:', { totalSpaces, originalTotal });

      let maxAgeForLog = 0;
      processed.forEach((d) => {
        const a = calculateDataAge(d?.Timestamp);
        if (a > maxAgeForLog) maxAgeForLog = a;
      });
      console.debug('[Parking] Max age (min):', maxAgeForLog, 'All offline:', allOffline);
    } catch (e) {
      console.error('[Parking] debug logging failed', e);
    }
  }, [processed, totalSpaces, originalTotal, lastRealtimeUpdate]);

  return (
    <SSafeArea className="flex-1 bg-bg-primary-dark">
      <StatusBar barStyle="light-content" />

      <SView className="w-full bg-bg-secondary-dark flex-row items-center justify-center py-3 px-4 border-b border-border-dark">
        <SText className="text-2xl mr-3">🅿️</SText>
        <SView className="items-center">
          <SText className="text-text-primary-dark text-lg font-semibold">{title}</SText>
          <SText className="text-text-secondary-dark text-xs mt-0.5">Real-time • UBS Wrocław</SText>
        </SView>
      </SView>

      {realtimeLoading && processed.length === 0 ? (
        <SView className="flex-1 items-center justify-center">
          <SText className="text-text-secondary-dark text-lg">Loading parking data...</SText>
        </SView>
      ) : realtimeError ? (
        <SView className="flex-1 items-center justify-center px-4">
          <SText className="text-warning-dark text-base text-center">{String(realtimeError)}</SText>
        </SView>
      ) : (
        <SView className="flex-1 px-3 py-2">
          <SView className="flex-row gap-2 mb-3">
            {processed.map((d, i) => (
              <SView key={d.ParkingGroupName || i} className="flex-1 rounded-lg p-3 border border-border-dark bg-bg-secondary-dark">
                <SText className="text-base font-semibold text-center text-text-primary-dark mb-2">
                  {d.ParkingGroupName === 'Bank_1' ? 'Uni Wroc' : d.ParkingGroupName}
                </SText>
                {(() => {
                  const age = calculateDataAge(d.Timestamp, now);
                  const colorClass = allOffline ? 'text-text-secondary-dark' : (age >= 15 ? 'text-warning-dark' : (age > 5 ? 'text-amber-600' : 'text-success-dark'));
                  const value = d.approximationInfo?.isApproximated ? d.approximationInfo.approximated : (d.CurrentFreeGroupCounterValue || 0);
                  return (
                    <SView className="flex-row items-center justify-center">
                      {d.approximationInfo?.isApproximated && <SText className="text-6xl text-amber-600 mr-1">≈</SText>}
                      <SText className={`text-6xl font-bold text-center ${colorClass}`}>{value}</SText>
                    </SView>
                  );
                })()}
                {d.approximationInfo?.isApproximated && (
                  <SText className="text-sm text-text-secondary-dark text-center mt-1">(orig: {d.approximationInfo?.original ?? d.CurrentFreeGroupCounterValue ?? 0})</SText>
                )}
                <SText className="text-sm text-text-secondary-dark text-center mt-2">
                  {(() => {
                    const age = calculateDataAge(d.Timestamp, now);
                    const { display } = formatAgeLabel(age);
                    return display;
                  })()}
                </SText>
              </SView>
            ))}
          </SView>

          <SView className="mb-2">
            <SText className={`text-sm font-semibold text-center ${totalColorClass}`}>
              {statusMessage}
            </SText>
          </SView>

          <SView className="rounded-lg bg-bg-secondary-dark border border-border-dark">
            <SView className="p-3 items-center border-b border-border-dark">
              <SText className="text-xs text-text-secondary-dark">Total Spaces</SText>
              <SView className="flex-row items-baseline mt-1">
                {hasApproximation && <SText className="text-3xl text-amber-600 mr-1">≈</SText>}
                <SText className={`text-3xl font-bold ${totalColorClass}`}>{totalSpaces}</SText>
              </SView>
              {hasApproximation && (
                <SText className="text-xs text-text-secondary-dark italic">
                  (orig: {originalTotal})
                </SText>
              )}
            </SView>

            <SView className="p-3 items-center border-b border-border-dark">
              <SText className="text-xs text-text-secondary-dark mb-1">Last Update / Current</SText>
              <SView className="flex-row items-baseline gap-2">
                <SText className="text-base font-bold text-text-primary-dark">
                  {lastRealtimeUpdate ? new Date(lastRealtimeUpdate).toLocaleTimeString('pl-PL') : '--:--:--'}
                </SText>
                <SText className="text-sm text-text-secondary-dark">
                  {now.toLocaleTimeString('pl-PL')}
                </SText>
              </SView>
            </SView>

            <SView className="p-3 items-center">
              <SText className="text-xs text-text-secondary-dark mb-1">Status</SText>
              <SText className={`text-xl font-bold ${hasApproximation ? 'text-amber-600' : 'text-success-dark'}`}>
                {hasApproximation ? 'APPROX' : 'ONLINE'}
              </SText>
            </SView>
          </SView>
        </SView>
      )}
    </SSafeArea>
  );
}

const AppContent = () => {
  const { colorScheme } = useTheme();

  return (
    <View className={colorScheme} style={{ flex: 1 }}>
      <DashboardContent />
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ParkingDataProvider>
        <AppContent />
      </ParkingDataProvider>
    </ThemeProvider>
  );
}
