import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatAgeLabel } from 'parking-shared/src/parkingUtils';

const ageColor = (now, timestamp, colors) => {
  if (!timestamp) return colors.textSecondary;
  const t = new Date(timestamp);
  if (Number.isNaN(t.getTime())) return colors.textSecondary;
  const diffMin = Math.floor((now - t) / 60000);
  if (diffMin >= 15) return colors.statusRed;
  if (diffMin >= 5) return colors.statusYellow;
  return colors.statusGreen;
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
  const { colors } = useTheme();

  const name = data.name || data.parkingName || 'Unknown';
  const free = data.freeSpaces ?? data.free ?? '-';
  const capacity = data.capacity ?? data.max ?? null; // Allow null for conditional rendering
  const timestamp = data.timestamp || data.lastUpdated || data.updated_at || null;
  const approx = data.approximation || data.approx || false;

  const ageMinutes = timestamp ? Math.floor((now - new Date(timestamp)) / 60000) : null;
  const { display: ageDisplay } = formatAgeLabel(ageMinutes);

  const onPress = useCallback(async () => {
    const text = `${name} — ${free}${capacity ? ` / ${capacity}` : ''}`;
    const ok = await tryCopyToClipboard(text);
    if (ok) {
      // short feedback
      try {
        Alert.alert('Copied', 'Parking info copied to clipboard');
      } catch (err) {
        // ignore clipboard/alert failures in tests or minimal environments
      }
    }
  }, [name, free, capacity]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.age, { color: ageColor(now, timestamp, colors) }]}>{ageDisplay}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.spaces, { color: colors.text }]}>{capacity ? `${free} / ${capacity}` : free}</Text>
          {approx ? (
            <Text style={[styles.badge, { color: colors.text, backgroundColor: colors.surface }]}>Approx</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  age: { fontSize: 12 },
  spaces: { fontSize: 14, marginTop: 6 },
  badge: { fontSize: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
});

export default ParkingCard;
