import "./index.css";
import React, { useMemo } from 'react';
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
    Timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString().replace('T', ' '), // 2 minutes ago
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
    if (allOffline) ageClass = 'text-slate-400';
    else if (age >= 15) ageClass = 'text-rose-600';
    else if (age > 5) ageClass = 'text-amber-500';
  } else if (age >= 15) ageClass = 'text-slate-400';
  else if (age > 5) ageClass = 'text-amber-500';

  return (
    <SView className="bg-white p-4 mb-3 rounded-lg shadow">
      <SText className="text-[16px] font-semibold mb-1">{name}</SText>
      <SText className={`text-2xl font-bold ${ageClass}`}>{freeSpots}</SText>
      {isApproximated && (
        <SText className="text-sm text-slate-500">(orig: {originalSpots})</SText>
      )}
      <SText className="text-sm text-slate-400 mt-2">{ageLabel}</SText>
    </SView>
  );
}

export default function App() {
  const now = new Date();

  const processed = useMemo(() => PARKING_PARAMS, []);

  const allOffline = processed.length > 0 && processed.every((d) => {
    const ts = d.Timestamp ? new Date(d.Timestamp.replace(' ', 'T')) : null;
    if (!ts) return true;
    const age = Math.max(0, Math.floor((now - ts) / 1000 / 60));
    return age >= 1440;
  });

  const totalSpaces = processed.reduce((sum, d) => {
    const info = d.approximationInfo || {};
    const value = info.isApproximated ? info.approximated : (d.CurrentFreeGroupCounterValue || 0);
    return sum + value;
  }, 0);

  const originalTotal = processed.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);

  return (
    <SSafeArea className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      {/* Header matching web App.css */}
      <SView className="w-full bg-[#282c34] items-center justify-center p-6">
        <SText className="text-white text-[20px] font-semibold">Parking Monitor</SText>
        <SText className="text-white text-sm mt-1">Real-time parking availability • UBS Wrocław</SText>
      </SView>

      <SScroll contentContainerStyle={{ padding: 16 }}>
        {processed.map((d, i) => (
          <ParkingCard key={i} data={d} now={now} allOffline={allOffline} />
        ))}

        <SView className="bg-white p-4 rounded-lg shadow mt-4">
          <SText className="text-sm text-slate-500">Total Spaces</SText>
          <SText className="text-2xl font-bold mt-1">{totalSpaces} {totalSpaces !== originalTotal ? <SText className="text-sm text-slate-400">(orig: {originalTotal})</SText> : null}</SText>
        </SView>

        {/* Footer link similar to web App.css */}
        <SView className="items-center mt-6">
          <SText className="text-[#61dafb]">View on web</SText>
        </SView>
      </SScroll>
    </SSafeArea>
  );
}
