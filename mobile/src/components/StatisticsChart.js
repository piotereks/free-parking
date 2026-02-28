import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLabel } from 'victory-native';
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

/**
 * StatisticsChart Component
 *
 * Displays a bar chart of current free vs occupied parking spaces
 * for each parking lot, using data from the parking store.
 *
 * @param {Array} data - Array of parking data objects from useParkingStore
 * @param {string} [palette='neon'] - Colour palette key
 */
const StatisticsChart = ({ data = [], palette = 'neon' }) => {
  const { isDark } = useTheme();

  const colors = PALETTES[palette] || PALETTES.neon;

  const textColor = isDark ? '#8b95c9' : '#1e293b';
  const axisColor = isDark ? '#2d3b6b' : '#cbd5e1';
  const bgCard = isDark ? '#1e2a4a' : '#f1f5f9';

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
      return {
        id: String(idx),
        displayName,
        free: freeVal,
        occupied,
        capacity,
        color: idx === 0 ? colors.gd : colors.uni,
        freePercent: capacity > 0 ? Math.round((freeVal / capacity) * 100) : 0,
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

  // Build bar chart data: free spaces per parking lot
  const barData = chartData.map((item, idx) => ({
    x: item.displayName,
    y: item.free,
    fill: item.color,
    label: `${item.free}`,
  }));

  const maxCapacity = Math.max(...chartData.map((d) => d.capacity), 1);

  return (
    <ScrollView>
      {/* Bar chart – free spaces */}
      <View
        style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: bgCard, marginBottom: 12, padding: 8 }}
        testID="statistics-chart"
      >
        <Text
          style={{ color: textColor, fontWeight: '600', fontSize: 14, marginBottom: 4, textAlign: 'center' }}
        >
          Free Spaces
        </Text>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ x: 40 }}
          domain={{ y: [0, maxCapacity] }}
          height={220}
        >
          <VictoryAxis
            style={{
              axis: { stroke: axisColor },
              tickLabels: { fill: textColor, fontSize: 11 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: axisColor },
              tickLabels: { fill: textColor, fontSize: 10 },
              grid: { stroke: axisColor, strokeDasharray: '4,4' },
            }}
          />
          <VictoryBar
            data={barData}
            style={{ data: { fill: ({ datum }) => datum.fill } }}
            labelComponent={<VictoryLabel dy={-4} style={{ fill: textColor, fontSize: 12 }} />}
          />
        </VictoryChart>
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
            <View
              style={{
                marginTop: 6,
                height: 6,
                width: '100%',
                borderRadius: 3,
                backgroundColor: isDark ? '#2d3b6b' : '#cbd5e1',
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
