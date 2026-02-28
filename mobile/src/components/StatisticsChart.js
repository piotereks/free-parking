import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PALETTES = {
  neon: { gd: '#05ffa1', uni: '#01beff' },
  classic: { gd: '#3b82f6', uni: '#f59e0b' },
  cyberpunk: { gd: '#00d9ff', uni: '#ff00cc' },
  modern: { gd: '#10b981', uni: '#6366f1' },
};

const CAPACITIES = {
  GreenDay: 187,
  'Uni Wroc': 41,
};

const BAR_MAX_HEIGHT = 160;

/**
 * StatisticsChart Component
 *
 * Displays a bar chart of current free vs occupied parking spaces
 * for each parking lot, using data from the parking store.
 *
 * Implemented with pure React Native Views — no native chart library required,
 * so it works in Expo Go and all managed-workflow builds.
 *
 * @param {Array} data - Array of parking data objects from useParkingStore
 * @param {string} [palette='neon'] - Colour palette key
 */
const StatisticsChart = ({ data = [], palette = 'neon' }) => {
  const { isDark } = useTheme();

  const colors = PALETTES[palette] || PALETTES.neon;

  const textColor = isDark ? '#8b95c9' : '#1e293b';
  const bgCard = isDark ? '#1e2a4a' : '#f1f5f9';
  const trackBg = isDark ? '#2d3b6b' : '#cbd5e1';
  const axisColor = isDark ? '#2d3b6b' : '#cbd5e1';

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((item, idx) => {
      const rawName = item.ParkingGroupName || '';
      const displayName = rawName === 'Bank_1' ? 'Uni Wroc' : rawName;
      const freeVal = item.approximationInfo?.isApproximated
        ? (item.approximationInfo.approximated ?? 0)
        : (item.CurrentFreeGroupCounterValue ?? 0);
      const capacity = CAPACITIES[displayName] ?? 100;
      const occupied = Math.max(0, capacity - freeVal);
      const freePercent = capacity > 0 ? Math.round((freeVal / capacity) * 100) : 0;
      return {
        id: String(idx),
        displayName,
        free: freeVal,
        occupied,
        capacity,
        color: idx === 0 ? colors.gd : colors.uni,
        freePercent,
      };
    });
  }, [data, colors]);

  if (chartData.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 14 }}>
          No data available for chart
        </Text>
      </View>
    );
  }

  const maxCapacity = Math.max(...chartData.map((d) => d.capacity), 1);

  return (
    <ScrollView>
      {/* Bar chart – free spaces */}
      <View
        style={{ borderRadius: 12, backgroundColor: bgCard, marginBottom: 12, padding: 12 }}
        testID="statistics-chart"
      >
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
          Free Spaces
        </Text>

        {/* Bars */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: BAR_MAX_HEIGHT + 24 }}>
          {chartData.map((item) => {
            const barHeight = Math.round((item.free / maxCapacity) * BAR_MAX_HEIGHT);
            const cappedBarHeight = Math.max(barHeight, 4);
            return (
              <View key={item.id} style={{ alignItems: 'center', flex: 1 }}>
                {/* Value label above bar */}
                <Text style={{ color: textColor, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                  {item.free}
                </Text>
                {/* The bar */}
                <View
                  style={{
                    width: 48,
                    height: cappedBarHeight,
                    backgroundColor: item.color,
                    borderRadius: 4,
                  }}
                  testID={`bar-${item.displayName}`}
                />
                {/* X-axis label */}
                <Text style={{ color: textColor, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
                  {item.displayName}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Axis line */}
        <View style={{ height: 1, backgroundColor: axisColor, marginTop: 2 }} />

        {/* Capacity legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 }}>
          {chartData.map((item) => (
            <Text key={item.id} style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 10 }}>
              cap: {item.capacity}
            </Text>
          ))}
        </View>
      </View>

      {/* Summary cards */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {chartData.map((item) => (
          <View
            key={item.id}
            style={{
              flex: 1,
              borderRadius: 10,
              backgroundColor: bgCard,
              padding: 10,
              alignItems: 'center',
            }}
            testID={`stats-card-${item.displayName}`}
          >
            <Text style={{ color: item.color, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>
              {item.displayName}
            </Text>
            <Text style={{ color: textColor, fontSize: 22, fontWeight: '800' }}>
              {item.free}
            </Text>
            <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 11 }}>
              free / {item.capacity}
            </Text>
            {/* Progress bar */}
            <View
              style={{
                marginTop: 6,
                height: 6,
                width: '100%',
                borderRadius: 3,
                backgroundColor: trackBg,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${item.freePercent}%`,
                  borderRadius: 3,
                  backgroundColor: item.color,
                }}
              />
            </View>
            <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 11, marginTop: 3 }}>
              {item.freePercent}% free
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default StatisticsChart;

