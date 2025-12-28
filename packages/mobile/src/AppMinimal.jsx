import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { API_URLS } from '@free-parking/shared';
import { parseTimestamp, formatTime, getAgeInMinutes } from '@free-parking/shared';
import { normalizeParkingName } from '@free-parking/shared';

export default function AppMinimal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchOne = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = API_URLS[0] + '?time=' + Date.now();
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const json = await resp.json();
      setData(json);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  const groupName = normalizeParkingName(data?.ParkingGroupName || '');
  const free = data?.CurrentFreeGroupCounterValue ?? null;
  const ts = data?.Timestamp || null;
  const tsDate = parseTimestamp(ts);
  const age = tsDate ? getAgeInMinutes(tsDate) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking (MVP)</Text>
      {loading && (
        <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>
      )}
      {!loading && error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}
      {!loading && !error && data && (
        <View style={styles.card}>
          <Text style={styles.name}>{groupName || 'Unknown'}</Text>
          <Text style={styles.value}>{free ?? '--'}</Text>
          <Text style={styles.meta}>Last updated: {formatTime(tsDate)} ({age != null ? `${age} min ago` : 'n/a'})</Text>
        </View>
      )}
      <View style={styles.actions}>
        <Button title="Refresh" onPress={fetchOne} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64, paddingHorizontal: 16, backgroundColor: '#fff' },
  center: { marginTop: 24 },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  error: { color: '#c00', textAlign: 'center', marginVertical: 8 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, gap: 6 },
  name: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 36, fontWeight: '700' },
  meta: { fontSize: 12, color: '#666' },
  actions: { marginTop: 24 }
});
