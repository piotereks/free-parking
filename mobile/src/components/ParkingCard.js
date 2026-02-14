import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatAgeLabel, calculateDataAge } from 'parking-shared';

const getAgeColorClass = (ageMinutes) => {
  if (ageMinutes === null || ageMinutes === Infinity) return 'text-text-secondary-light';
  if (ageMinutes >= 15) return 'text-warning-light';
  if (ageMinutes >= 5) return 'text-warning-medium-light';
  return 'text-success-light';
};

const tryCopyToClipboard = async (text) => {
  try {
    // try to use expo-clipboard if available
    // dynamically require to avoid hard dependency in tests
    // eslint-disable-next-line global-require
    const Clipboard = require('expo-clipboard');
    if (Clipboard && Clipboard.setStringAsync) {
      await Clipboard.setStringAsync(String(text));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

const ParkingCard = ({ data = {}, now = new Date(), allOffline = false }) => {
  const { isDark } = useTheme();

  const name = data.name || data.parkingName || 'Unknown';
  const free = data.freeSpaces ?? data.free ?? '-';
  const capacity = data.capacity ?? data.max ?? null;
  const timestamp = data.timestamp || data.lastUpdated || data.updated_at || null;
  const approx = data.approximation || data.approx || false;

  const ageMinutes = timestamp ? calculateDataAge(timestamp, now) : null;
  const { display: ageDisplay } = formatAgeLabel(ageMinutes);
  const ageColorClass = getAgeColorClass(ageMinutes);

  const onPress = useCallback(async () => {
    const text = `${name} — ${free}${capacity ? ` / ${capacity}` : ''}`;
    const ok = await tryCopyToClipboard(text);
    if (ok) {
      try {
        Alert.alert('Copied', 'Parking info copied to clipboard'); // Ensure no invalid Unicode characters
      } catch (err) {
        // ignore clipboard/alert failures in tests or minimal environments
      }
    }
  }, [name, free, capacity]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View className={"p-3 border-b border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-card-dark"}>
        <View className={"flex-row justify-between items-center"}>
          <Text className={"text-base font-semibold text-text-primary-light dark:text-text-primary-dark"}>{name}</Text>
          <Text className={`text-xs ${ageColorClass}`}>{ageDisplay}</Text>
        </View>
        <View className={"flex-row justify-between items-center mt-1.5"}>
          <Text className={"text-sm text-text-primary-light dark:text-text-primary-dark"}>{capacity ? `${free} / ${capacity}` : free}</Text>
          {approx ? (
            <Text className={"text-xs px-1.5 py-0.5 rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-primary-light dark:text-text-primary-dark"}>Approx</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ParkingCard;
