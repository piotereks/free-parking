import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const formatAge = (now, timestamp) => {
  if (!timestamp) return '—';
  const t = new Date(timestamp);
  if (Number.isNaN(t.getTime())) return '—';
  const diffMin = Math.floor((now - t) / 60000);
  if (diffMin <= 0) return 'just now';
  if (diffMin === 1) return '1 min ago';
  return `${diffMin} min ago`;
};

const ageColor = (now, timestamp) => {
  if (!timestamp) return '#666';
  const t = new Date(timestamp);
  if (Number.isNaN(t.getTime())) return '#666';
  const diffMin = Math.floor((now - t) / 60000);
  if (diffMin >= 15) return '#b00020'; // red
  if (diffMin >= 5) return '#f2a900'; // yellow
  return '#2e7d32'; // green
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
  const name = data.name || data.parkingName || 'Unknown';
  const free = data.freeSpaces ?? data.free ?? '-';
  const capacity = data.capacity ?? data.max ?? '-';
  const timestamp = data.timestamp || data.lastUpdated || data.updated_at || null;
  const approx = data.approximation || data.approx || false;

  const onPress = useCallback(async () => {
    const text = `${name} — ${free} / ${capacity}`;
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
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.name}>{name}</Text>
          <Text style={[styles.age, { color: ageColor(now, timestamp) }]}>{formatAge(now, timestamp)}</Text>
        </View>
        <View style={styles.row}> 
          <Text style={styles.spaces}>{`${free} / ${capacity}`}</Text>
          {approx ? <Text style={styles.badge}>Approx</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  age: { fontSize: 12 },
  spaces: { fontSize: 14, marginTop: 6 },
  badge: { fontSize: 12, color: '#444', backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
});

export default ParkingCard;
