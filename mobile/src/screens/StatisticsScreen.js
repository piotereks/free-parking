import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';
import { applyApproximations } from 'parking-shared';
import StatisticsChart from '../components/StatisticsChart';

const PALETTE_LABELS = [
  { key: 'neon', label: 'Neon' },
  { key: 'classic', label: 'Classic' },
  { key: 'cyberpunk', label: 'Cyber' },
  { key: 'modern', label: 'Modern' },
];

/**
 * StatisticsScreen
 *
 * Shows a parking-statistics chart identical in data to the web Statistics view
 * but rendered with victory-native (SVG based, works in Expo managed Android/iOS).
 *
 * @param {Function} onBack - Callback to return to the dashboard
 */
const StatisticsScreen = ({ onBack }) => {
  const { isDark } = useTheme();
  const [palette, setPalette] = useState('neon');

  const realtimeData = useParkingStore((s) => s.realtimeData);
  const realtimeLoading = useParkingStore((s) => s.realtimeLoading);
  const realtimeError = useParkingStore((s) => s.realtimeError);

  const now = new Date();
  const processedData = Array.isArray(realtimeData) ? applyApproximations(realtimeData, now) : [];

  const headerBg = isDark ? '#0f172a' : '#f8fafc';
  const borderColor = isDark ? '#1e2a4a' : '#e2e8f0';
  const textColor = isDark ? '#e0e6ff' : '#1e293b';
  const mutedColor = isDark ? '#6b7280' : '#94a3b8';
  const activePaletteBg = isDark ? '#1e2a4a' : '#e0e6ff';
  const inactivePaletteBg = isDark ? '#0f172a' : '#f1f5f9';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }} testID="statistics-screen">
      {/* Header */}
      <View
        style={{
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
          style={{ marginRight: 12 }}
          testID="back-button"
        >
          <Text style={{ color: textColor, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: textColor, fontSize: 17, fontWeight: '700', flex: 1 }}>
          📈 Parking Statistics
        </Text>
      </View>

      {/* Palette selector */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 6,
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        {PALETTE_LABELS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setPalette(key)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${label} palette`}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 6,
              backgroundColor: palette === key ? activePaletteBg : inactivePaletteBg,
              borderWidth: 1,
              borderColor: palette === key ? (isDark ? '#3b82f6' : '#6366f1') : borderColor,
            }}
          >
            <Text style={{ color: palette === key ? (isDark ? '#e0e6ff' : '#1e293b') : mutedColor, fontSize: 12 }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {realtimeLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ color: mutedColor, fontSize: 14 }}>Loading parking data…</Text>
          </View>
        )}

        {realtimeError && !realtimeLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ color: '#f97316', fontSize: 14, textAlign: 'center' }}>
              {String(realtimeError)}
            </Text>
          </View>
        )}

        {!realtimeLoading && !realtimeError && (
          <StatisticsChart data={processedData} palette={palette} />
        )}

        <Text style={{ color: mutedColor, fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          GD capacity: 187 spaces · Uni Wroc capacity: 41 spaces
        </Text>
      </ScrollView>
    </View>
  );
};

export default StatisticsScreen;
