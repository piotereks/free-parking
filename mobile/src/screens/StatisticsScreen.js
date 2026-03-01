import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';
import useOrientation from '../hooks/useOrientation';
import pkg from '../../package.json';
import StatisticsChart from '../components/StatisticsChart';

let AdMobManager = null;
try {
  AdMobManager = require('../../AdMobManager').default;
} catch (e) {
  console.warn('AdMobManager failed to load:', e && e.message ? e.message : e);
}

const PALETTE_LABELS = [
  { key: 'neon', label: 'Neon' },
  { key: 'classic', label: 'Classic' },
  { key: 'cyberpunk', label: 'Cyber' },
  { key: 'modern', label: 'Modern' },
];

/**
 * StatisticsScreen
 *
 * Shows a parking free-space history line chart matching the web Statistics view.
 * Header mirrors the DashboardContent header structure and dimensions —
 * the only difference is the title ("Parking Statistics") and the 🏠 back button
 * replacing the 📈 stats button.
 *
 * @param {Function} onBack - Callback to return to the dashboard
 */
const StatisticsScreen = ({ onBack }) => {
  const { isDark, setTheme } = useTheme();
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [palette, setPalette] = useState('neon');

  const version = pkg?.version || '0.0.0';
  const title = screenWidth < 700 ? 'Parking Stats' : 'Parking Statistics';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const openDonate = () => Linking.openURL('https://buycoffee.to/piotereks');

  const historyData = useParkingStore((s) => s.historyData);
  const historyLoading = useParkingStore((s) => s.historyLoading);

  return (
    <SafeAreaView className={`flex-1 bg-primary dark:bg-primary-dark ${isDark ? 'dark' : ''}`} testID="statistics-screen">
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />

      {/* Full-width header — portrait only (identical dimensions to DashboardContent portrait header) */}
      {!isLandscape && (
        <View className="w-full bg-secondary dark:bg-secondary-dark py-3 px-4 border-b border-border dark:border-border-dark">
          <View className="flex-row items-center justify-between mb-1">
            <Image
              source={require('../../assets/favicon.png')}
              style={{ width: 36, height: 36, marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-foreground dark:text-foreground-dark text-lg font-semibold">
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark shadow-custom-light dark:shadow-custom-dark"
              style={{ width: 44, height: 44 }}
            >
              <Text className="text-2xl">
                {isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
            {/* 🏠 Dashboard button — replaces the 📈 stats button from the dashboard header */}
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to dashboard"
              className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
              style={{ width: 44, height: 44, marginLeft: 8 }}
              testID="back-button"
            >
              <Text className="text-2xl">🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openDonate}
              accessibilityRole="link"
              accessibilityLabel="Buy me a coffee — support development"
              className="flex-row items-center justify-center rounded-lg border border-border dark:border-border-dark"
              style={{ height: 44, paddingHorizontal: 10, marginLeft: 8, backgroundColor: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.20)' }}
            >
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark" style={{ marginRight: 4 }}>Buy me</Text>
              <Text style={{ fontSize: 22 }}>☕</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-muted dark:text-muted-dark text-xs" style={{ marginLeft: 48 }}>
            Version: {version}
          </Text>
        </View>
      )}

      {/* Palette selector row — portrait only (below header, like the floating label row in dashboard) */}
      {!isLandscape && (
        <View className="w-full bg-secondary dark:bg-secondary-dark px-3 py-2 border-b border-border dark:border-border-dark flex-row" style={{ gap: 6 }}>
          {PALETTE_LABELS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setPalette(key)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label} palette`}
              className="rounded-md border"
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: palette === key
                  ? (isDark ? '#1e2a4a' : '#e0e6ff')
                  : (isDark ? '#0f172a' : '#f1f5f9'),
                borderColor: palette === key
                  ? (isDark ? '#3b82f6' : '#6366f1')
                  : (isDark ? '#1e2a4a' : '#e2e8f0'),
              }}
            >
              <Text
                className="text-xs"
                style={{ color: palette === key ? (isDark ? '#e0e6ff' : '#1e293b') : (isDark ? '#6b7280' : '#94a3b8') }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLandscape ? (
        /* ── LANDSCAPE: header column + chart on same row (mirrors DashboardContent landscape layout) ── */
        <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 6 }}>
          <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
            {/* Header column — identical dimensions to DashboardContent landscape header column */}
            <View
              className="rounded-lg bg-secondary dark:bg-secondary-dark border border-border dark:border-border-dark"
              style={{ width: Math.floor(screenWidth * 0.25), maxWidth: 200, padding: 8, justifyContent: 'space-between', alignItems: 'center' }}
            >
              {/* Logo + title on same row */}
              <View style={{ alignItems: 'center', gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Image
                    source={require('../../assets/favicon.png')}
                    style={{ width: 24, height: 24, flexShrink: 0 }}
                  />
                  <Text className="text-foreground dark:text-foreground-dark font-semibold" numberOfLines={2} style={{ flexShrink: 1, fontSize: 18 }}>
                    {title}
                  </Text>
                </View>
                <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 12 }} numberOfLines={1}>
                  Version: {version}
                </Text>
                <Text className="text-muted dark:text-muted-dark" style={{ fontSize: screenHeight < 400 ? 11 : 14 }} numberOfLines={2}>
                  History • GD-Uni Wrocław
                </Text>
              </View>
              <View style={{ gap: 6, alignItems: 'center' }}>
                {/* Theme toggle + refresh (history) + Dashboard button — same layout as dashboard */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    accessibilityRole="button"
                    accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                  >
                    <Text className="text-xl">
                      {isDark ? '☀️' : '🌙'}
                    </Text>
                  </TouchableOpacity>
                  {/* Palette cycle button (occupies the refresh slot to maintain identical dimensions) */}
                  <TouchableOpacity
                    onPress={() => {
                      const keys = PALETTE_LABELS.map(p => p.key);
                      const next = keys[(keys.indexOf(palette) + 1) % keys.length];
                      setPalette(next);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Cycle color palette"
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                    testID="palette-cycle-button"
                  >
                    {historyLoading ? (
                      <ActivityIndicator size="small" color={isDark ? '#e0e6ff' : '#333333'} />
                    ) : (
                      <Text className="text-xl text-foreground dark:text-foreground-dark">🎨</Text>
                    )}
                  </TouchableOpacity>
                  {/* 🏠 Dashboard button — replaces the 📈 stats button */}
                  <TouchableOpacity
                    onPress={onBack}
                    accessibilityRole="button"
                    accessibilityLabel="Back to dashboard"
                    className="flex items-center justify-center rounded-lg border bg-bg-primary-light border-border dark:bg-bg-primary-dark dark:border-border-dark"
                    style={{ width: 36, height: 36 }}
                    testID="back-button-landscape"
                  >
                    <Text className="text-xl">🏠</Text>
                  </TouchableOpacity>
                </View>
                {/* Buy me ☕ on its own row below — same as dashboard */}
                <TouchableOpacity
                  onPress={openDonate}
                  accessibilityRole="link"
                  accessibilityLabel="Buy me a coffee — support development"
                  className="flex-row items-center justify-center rounded-lg border border-border dark:border-border-dark"
                  style={{ height: 36, paddingHorizontal: 6, backgroundColor: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.20)' }}
                >
                  <Text className="text-xs font-semibold text-foreground dark:text-foreground-dark" style={{ marginRight: 2 }}>Buy me</Text>
                  <Text style={{ fontSize: 18 }}>☕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Chart area column: palette strip + chart */}
            <View style={{ flex: 1, flexDirection: 'column' }}>
              {/* Palette selector strip — separated from header */}
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
                {PALETTE_LABELS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setPalette(key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${label} palette`}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 4,
                      borderWidth: 1,
                      backgroundColor: palette === key ? (isDark ? '#1e2a4a' : '#e0e6ff') : 'transparent',
                      borderColor: palette === key ? (isDark ? '#3b82f6' : '#6366f1') : (isDark ? '#1e2a4a' : '#e2e8f0'),
                    }}
                  >
                    <Text style={{ fontSize: 11, color: palette === key ? (isDark ? '#e0e6ff' : '#1e293b') : (isDark ? '#6b7280' : '#94a3b8') }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chart */}
              <View style={{ flex: 1 }}>
                {historyLoading ? (
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 14 }}>Loading history data…</Text>
                  </View>
                ) : (
                  <StatisticsChart
                    historyData={historyData}
                    palette={palette}
                    showSummary={screenHeight >= 400}
                    scrollEnabled={false}
                    chartHeight={Math.max(80, screenHeight - 152)}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* ── PORTRAIT: scrollable chart ── */
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
          {historyLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 14 }}>Loading history data…</Text>
            </View>
          )}

          {!historyLoading && (
            <StatisticsChart historyData={historyData} palette={palette} />
          )}

          <Text className="text-muted dark:text-muted-dark" style={{ fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            GD capacity: 187 spaces · Uni Wroc capacity: 41 spaces
          </Text>
        </ScrollView>
      )}

      {/* Ad Banner — same as dashboard */}
      {AdMobManager && (
        <View className="items-center bg-primary dark:bg-primary-dark">
          <AdMobManager />
        </View>
      )}
    </SafeAreaView>
  );
};

export default StatisticsScreen;


