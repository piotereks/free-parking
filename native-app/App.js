import "./index.css";
import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SSafeArea = styled(SafeAreaView);
const SView = styled(View);
const SText = styled(Text);
const SScroll = styled(ScrollView);

// Example parameters (shape matches the web app's ParkingCard `data`)
const PARKING_PARAMS = [
  {
    ParkingGroupName: 'Green Day',
    CurrentFreeGroupCounterValue: 44,
    Timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString().replace('T', ' '), // 8 minutes ago
    approximationInfo: { isApproximated: false }
  },
  {
    ParkingGroupName: 'Bank_1',
    CurrentFreeGroupCounterValue: 12,
    Timestamp: new Date(Date.now() - 10000 * 60 * 2).toISOString().replace('T', ' '), // 2 minutes ago
    approximationInfo: { isApproximated: false }
  },

];

const formatAgeLabel = (ageMinutes) => {
  if (ageMinutes < 1) return 'now';
  if (ageMinutes < 60) return `${ageMinutes}m`;
  if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h`;
  return `${Math.floor(ageMinutes / 1440)}d`;
};

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

  let ageClass = '';
  if (!isApproximated) {
    if (allOffline) ageClass = 'text-text-secondary-dark';
    else if (age >= 15) ageClass = 'text-warning-dark';
    else if (age > 5) ageClass = 'text-amber-600';
  } else if (age >= 15) ageClass = 'text-text-secondary-dark';
  else if (age > 5) ageClass = 'text-amber-600';

  return (
    <SView className="rounded-xl p-4 mb-3 flex flex-col items-center justify-center border border-border-dark bg-bg-secondary-dark shadow-lg">
      <SText className="text-base font-semibold mb-1 text-center text-text-primary-dark">{name}</SText>
      <SText className={`text-4xl font-bold ${ageClass || 'text-success-dark'} flex items-center justify-center`}>{freeSpots}</SText>
      {isApproximated && (
        <SText className="text-sm text-text-secondary-dark">(orig: {originalSpots})</SText>
      )}
      <SText className="text-sm text-text-secondary-dark mt-2">{ageLabel}</SText>
    </SView>
  );
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [lastUpdate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const processed = useMemo(() => PARKING_PARAMS, []);

  const allOffline = processed.length > 0 && processed.every((d) => {
    const ts = d.Timestamp ? new Date(d.Timestamp.replace(' ', 'T')) : null;
    if (!ts) return true;
    const age = Math.max(0, Math.floor((now - ts) / 1000 / 60));
    return age >= 1440;
  });

  const hasApproximation = processed.some(d => d.approximationInfo?.isApproximated);

  const totalSpaces = processed.reduce((sum, d) => {
    const info = d.approximationInfo || {};
    const value = info.isApproximated ? info.approximated : (d.CurrentFreeGroupCounterValue || 0);
    return sum + value;
  }, 0);

  const originalTotal = processed.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);

  // Calculate aggregated status
  const getAggregatedStatus = () => {
    if (processed.length === 0) {
      return { colorClass: '', statusMessage: 'No data available' };
    }

    let maxAge = 0;
    processed.forEach((d) => {
      const ts = d.Timestamp ? new Date(d.Timestamp.replace(' ', 'T')) : null;
      if (ts) {
        const age = Math.max(0, Math.floor((now - ts) / 1000 / 60));
        maxAge = Math.max(maxAge, age);
      }
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

  return (
    <SSafeArea className="flex-1 bg-bg-primary-dark">
      <StatusBar barStyle="light-content" />

      {/* Header matching web App.css */}
      <SView className="w-full bg-bg-secondary-dark items-center justify-center p-6 border-b border-border-dark">
        <SText className="text-text-primary-dark text-xl font-semibold">Parking Monitor</SText>
        <SText className="text-text-secondary-dark text-sm mt-1">Real-time parking availability • UBS Wrocław</SText>
      </SView>

      <SScroll contentContainerStyle={{ padding: 16 }}>
        <SView className="mb-4 w-full items-center">
          <SText className="text-base text-text-secondary-dark text-center">Real-time parking availability • UBS Wrocław</SText>
        </SView>

        <SView className="mb-6">
          {processed.map((d, i) => (
            <ParkingCard key={d.ParkingGroupName || i} data={d} now={now} allOffline={allOffline} />
          ))}
        </SView>

        <SView className="mb-6 items-center">
          <SText className={`text-lg font-bold text-center px-4 ${totalColorClass}`}>
            {statusMessage}
          </SText>
        </SView>

        <SView className="rounded-xl shadow-lg mb-4 bg-bg-secondary-dark border border-border-dark">
          <SView className="flex-1 p-6 items-center">
            <SText className="text-sm mb-2 text-text-secondary-dark">Total Spaces</SText>
            <SView className="flex-row items-baseline">
              {hasApproximation && <SText className="text-amber-600 text-2xl mr-1">≈</SText>}
              <SText className={`text-4xl font-bold ${totalColorClass}`}>{totalSpaces}</SText>
            </SView>
            {hasApproximation && (
              <SText className="text-xs mt-1 text-text-secondary-dark italic">
                (orig: {originalTotal})
              </SText>
            )}
          </SView>

          <SView className="border-t border-border-dark flex-1 p-6 items-center">
            <SText className="text-sm mb-2 text-text-secondary-dark">Last Update / Current Time</SText>
            <SView className="flex-row items-baseline gap-3">
              <SText className="text-xl font-bold text-text-primary-dark">
                {lastUpdate.toLocaleTimeString('pl-PL')}
              </SText>
              <SText className="text-base text-text-secondary-dark">
                {now.toLocaleTimeString('pl-PL')}
              </SText>
            </SView>
          </SView>

          <SView className="border-t border-border-dark flex-1 p-6 items-center">
            <SText className="text-sm mb-2 text-text-secondary-dark">Data Status</SText>
            <SText className={`text-3xl font-bold ${hasApproximation ? 'text-amber-600' : 'text-success-dark'}`}>
              {hasApproximation ? 'APPROX' : 'ONLINE'}
            </SText>
          </SView>
        </SView>

        {/* Footer link similar to web App.css */}
        <SView className="items-center mt-6">
          <SText className="text-accent">View on web</SText>
        </SView>
      </SScroll>
    </SSafeArea>
  );
}
