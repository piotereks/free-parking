import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PALETTES = {
  neon: { gd: '#05ffa1', uni: '#01beff' },
  classic: { gd: '#3b82f6', uni: '#f59e0b' },
  cyberpunk: { gd: '#00d9ff', uni: '#ff00cc' },
  modern: { gd: '#10b981', uni: '#6366f1' },
};

const CHART_HEIGHT = 220;
const PAD = { left: 32, right: 12, top: 12, bottom: 28 };
const Y_MAX = 200;
const GD_CAPACITY = 187;
const UNI_CAPACITY = 41;

/** Horizontal dashed line rendered as a row of small Views */
const DashedHLine = ({ x, y, width, color }) => {
  const items = [];
  const dash = 5, gap = 4;
  for (let ix = 0; ix < width; ix += dash + gap) {
    items.push(
      <View
        key={ix}
        style={{
          position: 'absolute',
          left: x + ix,
          top: y,
          width: Math.min(dash, width - ix),
          height: 1,
          backgroundColor: color,
          opacity: 0.8,
        }}
      />
    );
  }
  return <>{items}</>;
};

/** Single line segment from (x1,y1) to (x2,y2) using a rotated View */
const LineSegment = ({ x1, y1, x2, y2, color, strokeWidth = 2.5 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return null;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <View
      style={{
        position: 'absolute',
        left: (x1 + x2) / 2 - len / 2,
        top: (y1 + y2) / 2 - strokeWidth / 2,
        width: len,
        height: strokeWidth,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
};

/**
 * StatisticsChart Component
 *
 * Displays a line chart of free-space history over time for each parking lot,
 * matching the web app's Statistics view. Uses only React Native View/Text —
 * no native chart library required, works in Expo Go and all managed builds.
 *
 * @param {Array} historyData - Parsed CSV rows from the parking history spreadsheet
 * @param {string} [palette='neon'] - Colour palette key
 */
const StatisticsChart = ({ historyData = [], palette = 'neon' }) => {
  const { isDark } = useTheme();
  const [chartWidth, setChartWidth] = useState(0);

  const colors = PALETTES[palette] || PALETTES.neon;
  const textColor = isDark ? '#8b95c9' : '#1e293b';
  const bgCard = isDark ? '#1e2a4a' : '#f1f5f9';
  const trackBg = isDark ? '#2d3b6b' : '#cbd5e1';
  const gridColor = isDark ? '#2d3b6b' : '#cbd5e1';
  const axisColor = isDark ? '#3d4b7b' : '#94a3b8';

  const { gdSeries, uniSeries, latestGD, latestUni } = useMemo(() => {
    if (!Array.isArray(historyData) || historyData.length === 0) {
      return { gdSeries: [], uniSeries: [], latestGD: null, latestUni: null };
    }

    const gdMap = new Map();
    const uniMap = new Map();

    historyData.forEach(row => {
      const findKey = (name) => Object.keys(row).find(k => k.trim().toLowerCase() === name);
      const gdTimeKey = findKey('gd_time');
      const gdFreeKey = findKey('greenday free');
      const uniTimeKey = findKey('uni_time');
      const uniFreeKey = findKey('uni free');

      if (gdTimeKey && gdFreeKey && row[gdTimeKey] && row[gdFreeKey]) {
        const ts = row[gdTimeKey].trim();
        const val = parseFloat(row[gdFreeKey]);
        if (!isNaN(val)) gdMap.set(ts, val);
      }
      if (uniTimeKey && uniFreeKey && row[uniTimeKey] && row[uniFreeKey]) {
        const ts = row[uniTimeKey].trim();
        const val = parseFloat(row[uniFreeKey]);
        if (!isNaN(val)) uniMap.set(ts, val);
      }
    });

    const toSeries = (map) =>
      Array.from(map.entries())
        .map(([ts, v]) => {
          const d = new Date(ts.replace(' ', 'T'));
          return isNaN(d.getTime()) ? null : { t: d.getTime(), v };
        })
        .filter(Boolean)
        .sort((a, b) => a.t - b.t);

    const gd = toSeries(gdMap);
    const uni = toSeries(uniMap);
    return {
      gdSeries: gd.slice(-200),
      uniSeries: uni.slice(-200),
      latestGD: gd.length > 0 ? gd[gd.length - 1].v : null,
      latestUni: uni.length > 0 ? uni[uni.length - 1].v : null,
    };
  }, [historyData]);

  const isEmpty = gdSeries.length === 0 && uniSeries.length === 0;

  if (isEmpty) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 14 }}>
          No data available for chart
        </Text>
      </View>
    );
  }

  const cW = Math.max(chartWidth - PAD.left - PAD.right, 0);
  const cH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const allT = [...gdSeries.map(d => d.t), ...uniSeries.map(d => d.t)];
  const minT = Math.min(...allT);
  const maxT = Math.max(...allT);
  const tRange = maxT - minT || 1;

  const toX = (t) => PAD.left + ((t - minT) / tRange) * cW;
  const toY = (v) => PAD.top + (1 - Math.min(Math.max(v, 0), Y_MAX) / Y_MAX) * cH;

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const xLabels = allT.length > 0
    ? [
        { x: toX(minT), label: fmtTime(minT) },
        { x: toX(minT + tRange / 2), label: fmtTime(minT + tRange / 2) },
        { x: toX(maxT), label: fmtTime(maxT) },
      ]
    : [];

  const gdCapY = toY(GD_CAPACITY);
  const uniCapY = toY(UNI_CAPACITY);

  const summaryItems = [
    latestGD !== null ? { name: 'GreenDay', value: Math.round(latestGD), capacity: GD_CAPACITY, color: colors.gd } : null,
    latestUni !== null ? { name: 'Uni Wroc', value: Math.round(latestUni), capacity: UNI_CAPACITY, color: colors.uni } : null,
  ].filter(Boolean);

  return (
    <ScrollView>
      {/* Line chart card */}
      <View
        style={{ borderRadius: 12, backgroundColor: bgCard, marginBottom: 12, padding: 8 }}
        testID="statistics-chart"
      >
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 14, marginBottom: 4, textAlign: 'center' }}>
          Free Spaces History
        </Text>

        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 16, height: 3, backgroundColor: colors.gd, borderRadius: 2 }} />
            <Text style={{ color: textColor, fontSize: 11 }}>GreenDay</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 16, height: 3, backgroundColor: colors.uni, borderRadius: 2 }} />
            <Text style={{ color: textColor, fontSize: 11 }}>Uni Wroc</Text>
          </View>
        </View>

        {/* Chart canvas — use onLayout to get true width */}
        <View
          style={{ height: CHART_HEIGHT, position: 'relative' }}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
          testID="line-chart-canvas"
        >
          {chartWidth > 0 && (
            <>
              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <View
                  key={pct}
                  style={{
                    position: 'absolute',
                    left: PAD.left,
                    width: cW,
                    top: PAD.top + pct * cH,
                    height: 1,
                    backgroundColor: gridColor,
                    opacity: 0.4,
                  }}
                />
              ))}

              {/* Capacity dashed lines */}
              <DashedHLine x={PAD.left} y={gdCapY} width={cW} color={colors.gd} />
              <DashedHLine x={PAD.left} y={uniCapY} width={cW} color={colors.uni} />
              <Text style={{ position: 'absolute', left: PAD.left + cW - 22, top: gdCapY - 10, color: colors.gd, fontSize: 8, fontWeight: 'bold' }}>{GD_CAPACITY}</Text>
              <Text style={{ position: 'absolute', left: PAD.left + cW - 16, top: uniCapY + 2, color: colors.uni, fontSize: 8, fontWeight: 'bold' }}>{UNI_CAPACITY}</Text>

              {/* GreenDay line segments */}
              {gdSeries.map((pt, i) => {
                if (i === 0) return null;
                const prev = gdSeries[i - 1];
                return (
                  <LineSegment
                    key={`gd-${i}`}
                    x1={toX(prev.t)} y1={toY(prev.v)}
                    x2={toX(pt.t)} y2={toY(pt.v)}
                    color={colors.gd}
                  />
                );
              })}

              {/* Uni Wroc line segments */}
              {uniSeries.map((pt, i) => {
                if (i === 0) return null;
                const prev = uniSeries[i - 1];
                return (
                  <LineSegment
                    key={`uni-${i}`}
                    x1={toX(prev.t)} y1={toY(prev.v)}
                    x2={toX(pt.t)} y2={toY(pt.v)}
                    color={colors.uni}
                  />
                );
              })}

              {/* Y-axis */}
              <View style={{ position: 'absolute', left: PAD.left, top: PAD.top, height: cH, width: 1, backgroundColor: axisColor }} />
              <Text style={{ position: 'absolute', left: 0, top: PAD.top - 6, color: textColor, fontSize: 8 }}>200</Text>
              <Text style={{ position: 'absolute', left: 0, top: PAD.top + cH * 0.5 - 6, color: textColor, fontSize: 8 }}>100</Text>
              <Text style={{ position: 'absolute', left: 4, top: PAD.top + cH - 6, color: textColor, fontSize: 8 }}>0</Text>

              {/* X-axis */}
              <View style={{ position: 'absolute', left: PAD.left, top: PAD.top + cH, width: cW, height: 1, backgroundColor: axisColor }} />
              {xLabels.map((xl, i) => (
                <Text
                  key={i}
                  style={{
                    position: 'absolute',
                    left: xl.x - 14,
                    top: PAD.top + cH + 4,
                    color: textColor,
                    fontSize: 8,
                    width: 28,
                    textAlign: 'center',
                  }}
                >
                  {xl.label}
                </Text>
              ))}
            </>
          )}
        </View>
      </View>

      {/* Summary cards showing latest values */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {summaryItems.map((item) => {
          const freePercent = item.capacity > 0 ? Math.round((item.value / item.capacity) * 100) : 0;
          return (
            <View
              key={item.name}
              style={{
                flex: 1,
                borderRadius: 10,
                backgroundColor: bgCard,
                padding: 10,
                alignItems: 'center',
              }}
              testID={`stats-card-${item.name}`}
            >
              <Text style={{ color: item.color, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>
                {item.name}
              </Text>
              <Text style={{ color: textColor, fontSize: 22, fontWeight: '800' }}>
                {item.value}
              </Text>
              <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 11 }}>
                free / {item.capacity}
              </Text>
              <View
                style={{
                  marginTop: 6, height: 6, width: '100%',
                  borderRadius: 3, backgroundColor: trackBg, overflow: 'hidden',
                }}
              >
                <View style={{ height: '100%', width: `${freePercent}%`, borderRadius: 3, backgroundColor: item.color }} />
              </View>
              <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 11, marginTop: 3 }}>
                {freePercent}% free
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default StatisticsChart;


