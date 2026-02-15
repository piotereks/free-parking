import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import { useTheme } from '../context/ThemeContext';
import { allStyles } from '../../src/App';
import { logStyleUsage } from '../utils/allStylesLogger';

// Log the styles used by ParkingCard
['border','bg-card','bg-secondary','text-primary','text-secondary','text-warning','text-warning-medium','text-success'].forEach(k => {
  logStyleUsage('ParkingCard', allStyles, k, k.startsWith('bg') ? 'bg-' : (k.startsWith('text') ? 'text-' : ''));
});
import { formatAgeLabel, calculateDataAge } from 'parking-shared';


const getAgeColorClass = (ageMinutes) => {
  if (ageMinutes === null || ageMinutes === Infinity) return `text-${allStyles['text-secondary']}`;
  if (ageMinutes >= 15) return `text-${allStyles['text-warning']}`;
  if (ageMinutes >= 5) return `text-${allStyles['text-warning-medium']}`;
  return `text-${allStyles['text-success']}`;
};

const tryCopyToClipboard = async (text) => {
  try {
    // try to use expo-clipboard if available
    // dynamically require to avoid hard dependency in tests
     
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
      <View className={`p-3 border-b border-${allStyles['border'] || 'border'} bg-${allStyles['bg-card'] || 'bg-card'}`}>
        <View className={"flex-row justify-between items-center"}>
          <Text className={`text-base font-semibold text-${allStyles['text-primary'] || 'text-primary'}`}>{name}</Text>
          <Text className={`text-xs ${ageColorClass}`}>{ageDisplay}</Text>
        </View>
        <View className={"flex-row justify-between items-center mt-1.5"}>
          <Text className={`text-sm text-${allStyles['text-primary'] || 'text-primary'}`}>{capacity ? `${free} / ${capacity}` : free}</Text>
          {approx ? (
            <Text className={`text-xs px-1.5 py-0.5 rounded-md bg-${allStyles['bg-secondary'] || 'bg-secondary'} text-${allStyles['text-primary'] || 'text-primary'}`}>Approx</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ParkingCard;
