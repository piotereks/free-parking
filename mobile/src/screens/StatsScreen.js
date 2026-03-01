import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import Svg, { Line, Path, Text as SvgText, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import useParkingStore from '../hooks/useParkingStore';

// Time range options in hours — issue #133
const TIME_RANGES = [4, 8, 12, 24, 48];

const COLORS = {
  gd: '#05ffa1',
  uniWroc: '#01beff',
  zero: '#ef4444',
};

const PAD = { top: 24, right: 12, bottom: 48, left: 40 };

/**
 * StatsScreen — SVG line chart showing parking space history.
 * Addresses sub-issues of #109:
 *   #126 – vertical marker when total free spaces first hits 0
 *   #128 – title "Parking Stats"
 *   #132 – swipe left/right to pan the visible time window
 *   #133 – time range buttons 4h / 8h / 12h / 24h / 48h
 */
const StatsScreen = () => {
  const { isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const historyData = useParkingStore((s) => s.historyData);

  const [rangeHours, setRangeHours] = useState(24);
  const [panOffsetMs, setPanOffsetMs] = useState(0);

  // Keep pan state in refs so the responder closure always sees fresh values
  const panBaseOffset = useRef(0);
  const rangeHoursRef = useRef(rangeHours);
  rangeHoursRef.current = rangeHours;
  const panOffsetMsRef = useRef(panOffsetMs);
  panOffsetMsRef.current = panOffsetMs;

  const chartWidth = screenWidth - 16;
  const chartHeight = 220;
  const plotW = chartWidth - PAD.left - PAD.right;
  const plotH = chartHeight - PAD.top - PAD.bottom;

  // Swipe gesture to pan back in time — issue #132
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 6,
      onPanResponderGrant: () => {
        panBaseOffset.current = panOffsetMsRef.current;
      },
      onPanResponderMove: (_, gs) => {
        const msPerPx = (rangeHoursRef.current * 3600 * 1000) / plotW;
        const newOffset = Math.max(0, panBaseOffset.current - gs.dx * msPerPx);
        setPanOffsetMs(newOffset);
      },
    })
  ).current;

  const textColor = isDark ? '#8b95c9' : '#334155';
  const gridColor = isDark ? '#2d3b6b' : '#cbd5e1';
  const bgColor = isDark ? '#1a2236' : '#f8fafc';
  const headerBg = isDark ? '#1e293b' : '#ffffff';

  const { gdPoints, uniPoints, zeroX, xLabels, yMax } = useMemo(() => {
    const empty = { gdPoints: [], uniPoints: [], zeroX: null, xLabels: [], yMax: 200 };
    if (!Array.isArray(historyData) || historyData.length === 0) return empty;

    const now = Date.now();
    const windowMs = rangeHours * 3600 * 1000;
    const windowEnd = now - panOffsetMs;
    const windowStart = windowEnd - windowMs;

    const filtered = historyData
      .map((e) => ({ ...e, ts: new Date(e.timestamp).getTime() }))
      .filter((e) => !isNaN(e.ts) && e.ts >= windowStart && e.ts <= windowEnd)
      .sort((a, b) => a.ts - b.ts);

    if (filtered.length === 0) return empty;

    const tsToX = (ts) => ((ts - windowStart) / windowMs) * plotW;
    const allVals = filtered.flatMap((e) => [e.gd ?? 0, e.uni ?? 0]);
    const max = Math.max(200, ...allVals);
    const valToY = (v) => plotH - (Math.max(0, v) / max) * plotH;

    const toPoints = (key) =>
      filtered
        .filter((e) => e[key] !== null && e[key] !== undefined)
        .map((e) => ({ x: tsToX(e.ts), y: valToY(e[key]) }));

    // First moment total free spaces hits 0 — issue #126
    let zeroXVal = null;
    for (const e of filtered) {
      if ((e.total ?? Infinity) <= 0) {
        zeroXVal = tsToX(e.ts);
        break;
      }
    }

    // X-axis time tick labels: TICKS intervals → TICKS+1 boundary labels
    const TICKS = 4;
    const labels = Array.from({ length: TICKS + 1 }, (_, i) => {
      const ts = windowStart + (windowMs / TICKS) * i;
      const d = new Date(ts);
      return {
        x: (i / TICKS) * plotW,
        label: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      };
    });

    return { gdPoints: toPoints('gd'), uniPoints: toPoints('uni'), zeroX: zeroXVal, xLabels: labels, yMax: max };
  }, [historyData, rangeHours, panOffsetMs, plotW, plotH]);

  const toSvgPath = (points) => {
    if (points.length < 2) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${(PAD.left + p.x).toFixed(1)},${(PAD.top + p.y).toFixed(1)}`)
      .join(' ');
  };

  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];
  const hasData = gdPoints.length > 0 || uniPoints.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }}>
      {/* Header — issue #128 title "Parking Stats" */}
      <View style={{ backgroundColor: headerBg, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: gridColor }}>
        <Text style={{ color: textColor, fontSize: 17, fontWeight: '600' }} numberOfLines={1}>
          Parking Stats
        </Text>
      </View>

      {/* Time range buttons — issue #133: 4h/8h/12h/24h/48h */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4, gap: 6 }}>
        {TIME_RANGES.map((h) => {
          const active = rangeHours === h;
          return (
            <TouchableOpacity
              key={h}
              onPress={() => { setRangeHours(h); setPanOffsetMs(0); }}
              accessibilityRole="button"
              accessibilityLabel={`Show last ${h} hours`}
              style={{
                flex: 1,
                paddingVertical: 6,
                borderRadius: 6,
                alignItems: 'center',
                backgroundColor: active ? (isDark ? '#334155' : '#3b82f6') : (isDark ? '#1e293b' : '#e2e8f0'),
                borderWidth: 1,
                borderColor: active ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#334155' : '#cbd5e1'),
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#ffffff' : textColor }}>
                {h}h
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart — swipe to pan (issue #132) */}
      <View
        style={{ marginHorizontal: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: bgColor }}
        {...panResponder.panHandlers}
      >
        {!hasData ? (
          <View style={{ height: chartHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: textColor, fontSize: 13, textAlign: 'center' }}>
              No history yet. Data accumulates as you use the app.
            </Text>
          </View>
        ) : (
          <Svg width={chartWidth} height={chartHeight}>
            <Rect x={0} y={0} width={chartWidth} height={chartHeight} fill={bgColor} />

            {/* Grid lines + Y labels */}
            {yTicks.map((v) => {
              const y = PAD.top + plotH - (v / yMax) * plotH;
              return (
                <React.Fragment key={v}>
                  <Line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke={gridColor} strokeWidth={0.5} strokeDasharray="3,3" />
                  <SvgText x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill={textColor}>{v}</SvgText>
                </React.Fragment>
              );
            })}

            {/* X-axis baseline */}
            <Line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke={gridColor} strokeWidth={1} />

            {/* X-axis labels */}
            {xLabels.map((tick) => (
              <SvgText key={tick.label + tick.x} x={PAD.left + tick.x} y={PAD.top + plotH + 14} textAnchor="middle" fontSize={9} fill={textColor}>
                {tick.label}
              </SvgText>
            ))}

            {/* Vertical line at first zero-total moment — issue #126 */}
            {zeroX !== null && (
              <>
                <Line
                  x1={PAD.left + zeroX} y1={PAD.top}
                  x2={PAD.left + zeroX} y2={PAD.top + plotH}
                  stroke={COLORS.zero} strokeWidth={1.5} strokeDasharray="4,3"
                />
                <SvgText x={PAD.left + zeroX + 3} y={PAD.top + 10} fontSize={9} fill={COLORS.zero}>0</SvgText>
              </>
            )}

            {/* GreenDay line */}
            {gdPoints.length > 1 && <Path d={toSvgPath(gdPoints)} fill="none" stroke={COLORS.gd} strokeWidth={2} />}
            {gdPoints.length > 0 && (
              <Circle cx={PAD.left + gdPoints[gdPoints.length - 1].x} cy={PAD.top + gdPoints[gdPoints.length - 1].y} r={3} fill={COLORS.gd} />
            )}

            {/* Uni Wroc line */}
            {uniPoints.length > 1 && <Path d={toSvgPath(uniPoints)} fill="none" stroke={COLORS.uniWroc} strokeWidth={2} />}
            {uniPoints.length > 0 && (
              <Circle cx={PAD.left + uniPoints[uniPoints.length - 1].x} cy={PAD.top + uniPoints[uniPoints.length - 1].y} r={3} fill={COLORS.uniWroc} />
            )}
          </Svg>
        )}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 16, height: 3, backgroundColor: COLORS.gd, borderRadius: 2 }} />
          <Text style={{ color: textColor, fontSize: 12 }}>GreenDay</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 16, height: 3, backgroundColor: COLORS.uniWroc, borderRadius: 2 }} />
          <Text style={{ color: textColor, fontSize: 12 }}>Uni Wroc</Text>
        </View>
        {zeroX !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 2, height: 14, backgroundColor: COLORS.zero, borderRadius: 1 }} />
            <Text style={{ color: COLORS.zero, fontSize: 12 }}>Total=0</Text>
          </View>
        )}
      </View>

      {hasData && (
        <Text style={{ color: textColor, fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.5 }}>
          Swipe left/right to navigate time
        </Text>
      )}
    </View>
  );
};

export default StatsScreen;
