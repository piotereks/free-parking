import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, PanResponder } from 'react-native';
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
const MIN_WINDOW_SIZE = 2;
const PAN_STEP_RATIO = 0.25;
const ZOOM_HOURS = [4, 8, 12, 24, 48];
const SWIPE_THRESHOLD = 30;

/** Returns a fill-bar color based on the free-space percentage.
 *  ≥40% → green, 10–39% → orange, <10% → red, null → grey */
const getFreeBarColor = (pct) =>
  pct === null ? '#6b7280' : pct >= 40 ? '#22c55e' : pct >= 10 ? '#f97316' : '#ef4444';

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
 * @param {boolean} [showSummary=true] - Whether to render the latest-value summary cards below the chart
 * @param {boolean} [scrollEnabled=true] - Whether the root ScrollView can be scrolled; pass false to fix the chart within a landscape panel
 * @param {number} [chartHeight] - Override the canvas height (px); defaults to the built-in CHART_HEIGHT constant
 */
const StatisticsChart = ({ historyData = [], palette = 'neon', showSummary = true, scrollEnabled = true, chartHeight: chartHeightProp }) => {
  const resolvedChartHeight = chartHeightProp != null ? chartHeightProp : CHART_HEIGHT;
  const { isDark } = useTheme();
  const [chartWidth, setChartWidth] = useState(0);
  const [zoomHours, setZoomHours] = useState(48);
  const [panIndex, setPanIndex] = useState(0);

  const colors = PALETTES[palette] || PALETTES.neon;
  const textColor = isDark ? '#8b95c9' : '#1e293b';
  const bgCard = isDark ? '#1e2a4a' : '#f1f5f9';
  const trackBg = isDark ? '#2d3b6b' : '#cbd5e1';
  const gridColor = isDark ? '#2d3b6b' : '#cbd5e1';
  const axisColor = isDark ? '#3d4b7b' : '#94a3b8';

  const { gdSeries, uniSeries, latestGD, latestUni, firstZero } = useMemo(() => {
    if (!Array.isArray(historyData) || historyData.length === 0) {
      return { gdSeries: [], uniSeries: [], latestGD: null, latestUni: null, firstZero: null };
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

    // #126: Find first timestamp where GD+Uni total = 0 between 7–10am on weekdays
    let fz = null;
    for (const row of historyData) {
      if (fz) break;
      const findKey = (name) => Object.keys(row).find(k => k.trim().toLowerCase() === name);
      const gdTimeKey = findKey('gd_time');
      const gdFreeKey = findKey('greenday free');
      const uniFreeKey = findKey('uni free');
      if (gdTimeKey && gdFreeKey && uniFreeKey && row[gdTimeKey] && row[gdFreeKey] && row[uniFreeKey]) {
        const gdVal = parseFloat(row[gdFreeKey]);
        const uniVal = parseFloat(row[uniFreeKey]);
        const d = new Date(row[gdTimeKey].trim().replace(' ', 'T'));
        if (!isNaN(d.getTime()) && !isNaN(gdVal) && !isNaN(uniVal)) {
          const hour = d.getHours();
          const day = d.getDay(); // 0=Sun, 1=Mon…6=Sat
          if (day >= 1 && day <= 5 && hour >= 7 && hour < 10 && (gdVal + uniVal) === 0) {
            fz = { t: d.getTime() };
            break;
          }
        }
      }
    }

    return {
      gdSeries: gd.slice(-200),
      uniSeries: uni.slice(-200),
      latestGD: gd.length > 0 ? gd[gd.length - 1].v : null,
      latestUni: uni.length > 0 ? uni[uni.length - 1].v : null,
      firstZero: fz,
    };
  }, [historyData]);

  const isEmpty = gdSeries.length === 0 && uniSeries.length === 0;

  // Zoom / pan: derive visible window from zoomHours and total time span
  const maxSeriesLen = Math.max(gdSeries.length, uniSeries.length, 1);
  const allFullT = [...gdSeries.map(d => d.t), ...uniSeries.map(d => d.t)];
  const fullMinT = allFullT.length > 0 ? Math.min(...allFullT) : 0;
  const fullMaxT = allFullT.length > 0 ? Math.max(...allFullT) : 1;
  const totalHoursSpan = Math.max(1, (fullMaxT - fullMinT) / (3600 * 1000));
  const effectiveHours = Math.min(zoomHours, totalHoursSpan);
  const windowSize = Math.max(MIN_WINDOW_SIZE, Math.ceil(maxSeriesLen * (effectiveHours / totalHoursSpan)));
  const isZoomed = windowSize < maxSeriesLen;
  const clampedPan = Math.max(0, Math.min(panIndex, maxSeriesLen - windowSize));
  const panStep = Math.max(1, Math.round(windowSize * PAN_STEP_RATIO));
  const canPanLeft = clampedPan > 0;
  const canPanRight = clampedPan < maxSeriesLen - windowSize;

  // Compute time-based chart window boundaries from pan/zoom state.
  // chartMinT / chartMaxT are the actual time coordinates of the chart edges.
  // These are independent of where data points happen to land, so edge extension
  // segments will have non-zero length whenever a data point does not fall exactly
  // on the window boundary (which is the common case with real-world timestamps).
  const windowMs = effectiveHours * 3600 * 1000;
  const panFrac = (maxSeriesLen > windowSize) ? clampedPan / (maxSeriesLen - windowSize) : 1;
  const timeSpanMs = Math.max(1, fullMaxT - fullMinT);
  const chartMaxT = fullMinT + Math.min(timeSpanMs, windowMs + panFrac * Math.max(0, timeSpanMs - windowMs));
  const chartMinT = chartMaxT - windowMs;

  // Filter each series independently by time window (not by shared index slice).
  // This also fixes the case where series have different numbers of data points:
  // the shorter series would vanish completely with index-based slicing.
  const visibleGD = gdSeries.filter(p => p.t >= chartMinT && p.t <= chartMaxT);
  const visibleUni = uniSeries.filter(p => p.t >= chartMinT && p.t <= chartMaxT);

  const handleZoomHours = (hours) => {
    const eff = Math.min(hours, totalHoursSpan);
    const newWin = Math.max(MIN_WINDOW_SIZE, Math.ceil(maxSeriesLen * (eff / totalHoursSpan)));
    setPanIndex(Math.max(0, maxSeriesLen - newWin));
    setZoomHours(hours);
  };
  const panLeft = () => setPanIndex(Math.max(0, clampedPan - panStep));
  const panRight = () => setPanIndex(Math.min(maxSeriesLen - windowSize, clampedPan + panStep));

  // #132: Swipe gesture support via PanResponder (replaces arrow buttons)
  const swipeRef = useRef({});
  swipeRef.current = { canPanLeft, canPanRight, panStep, clampedPan, windowSize, maxSeriesLen };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => {
        const { windowSize: ws, maxSeriesLen: msl } = swipeRef.current;
        return ws < msl && Math.abs(gs.dx) > 10;
      },
      onPanResponderRelease: (_, gs) => {
        const ref = swipeRef.current;
        if (gs.dx > SWIPE_THRESHOLD && ref.canPanLeft) {
          setPanIndex(Math.max(0, ref.clampedPan - ref.panStep));
        } else if (gs.dx < -SWIPE_THRESHOLD && ref.canPanRight) {
          setPanIndex(Math.min(ref.maxSeriesLen - ref.windowSize, ref.clampedPan + ref.panStep));
        }
      },
    })
  ).current;

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
  const cH = resolvedChartHeight - PAD.top - PAD.bottom;

  // Use the fixed chart time boundaries so that toX is stable and edge extensions
  // can have non-zero length (minT / maxT must not equal the first / last data-point time).
  const minT = chartMinT;
  const maxT = chartMaxT;
  const tRange = maxT - minT || 1;

  const toX = (t) => PAD.left + ((t - minT) / tRange) * cW;
  const toY = (v) => PAD.top + (1 - Math.min(Math.max(v, 0), Y_MAX) / Y_MAX) * cH;

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Fit as many labels as the chart width allows (one per ~48 px, minimum 5, maximum 9)
  const nXLabels = cW > 0 ? Math.max(5, Math.min(9, Math.floor(cW / 48))) : 5;
  const xLabels = Array.from({ length: nXLabels }, (_, i) => {
    const t = minT + (tRange * i) / (nXLabels - 1);
    return { x: toX(t), label: fmtTime(t) };
  });

  const gdCapY = toY(GD_CAPACITY);
  const uniCapY = toY(UNI_CAPACITY);

  // --- Edge projection: extend lines to chart boundaries when zoomed/panned ---
  // chartMinT / chartMaxT are the FIXED chart edges (independent of data points), so
  // when a data point does not fall exactly on the boundary the interpolated v will
  // differ from the adjacent data-point value and the extension segment will have a
  // non-zero length that is visually apparent.
  const leftEdgeX = PAD.left;
  const rightEdgeX = PAD.left + cW;

  /**
   * Given two data points p0={t,v} and p1={t,v}, linearly interpolate the v
   * value at time tEdge (i.e. where the line p0→p1 crosses the chart boundary).
   * Returns the interpolated v, or null if the two points share the same timestamp.
   */
  const projectToEdge = (p0, p1, tEdge) => {
    const dt = p1.t - p0.t;
    if (dt === 0) return null;
    const frac = (tEdge - p0.t) / dt;
    const vEdge = p0.v + (p1.v - p0.v) * frac;
    return vEdge;
  };

  /**
   * Build a left-edge or right-edge extension segment for one series.
   * Uses the fixed chart time boundaries (chartMinT / chartMaxT) so that the
   * interpolated crossing point is correctly positioned along the x-axis.
   *
   * @param {Array} series - full data series (gdSeries / uniSeries)
   * @param {'left'|'right'} side - which chart edge to extend to
   * @returns {{x1,y1,x2,y2}|null} segment coords, or null if no extension needed
   */
  const buildEdgeSeg = (series, side) => {
    if (!chartWidth || !cW) return null;
    if (side === 'left') {
      // Find the first data point inside (or at) the window
      const firstInsideIdx = series.findIndex(p => p.t >= chartMinT && p.t <= chartMaxT);
      if (firstInsideIdx <= 0) return null; // no prior point to extend from
      const prev = series[firstInsideIdx - 1]; // guaranteed: prev.t < chartMinT
      const first = series[firstInsideIdx];
      const vEdge = projectToEdge(prev, first, chartMinT);
      if (vEdge === null) return null;
      return { x1: leftEdgeX, y1: toY(vEdge), x2: toX(first.t), y2: toY(first.v) };
    }
    // side === 'right'
    let lastInsideIdx = -1;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i].t >= chartMinT && series[i].t <= chartMaxT) { lastInsideIdx = i; break; }
    }
    if (lastInsideIdx < 0 || lastInsideIdx >= series.length - 1) return null;
    const last = series[lastInsideIdx]; // guaranteed: last.t <= chartMaxT
    const next = series[lastInsideIdx + 1]; // guaranteed: next.t > chartMaxT
    const vEdge = projectToEdge(last, next, chartMaxT);
    if (vEdge === null) return null;
    return { x1: toX(last.t), y1: toY(last.v), x2: rightEdgeX, y2: toY(vEdge) };
  };

  /**
   * Build a full-width pass-through segment when no data points lie inside the
   * chart window but the line connecting a prior and a next point crosses it.
   * This handles deep zoom where the window falls entirely between two data points.
   *
   * @param {Array} series - full data series
   * @returns {{x1,y1,x2,y2}|null} segment coords, or null
   */
  const buildPassThrough = (series) => {
    if (!chartWidth || !cW) return null;
    if (series.some(p => p.t >= chartMinT && p.t <= chartMaxT)) return null;
    let prev = null;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i].t < chartMinT) { prev = series[i]; break; }
    }
    const next = series.find(p => p.t > chartMaxT);
    if (!prev || !next) return null;
    const vLeft = projectToEdge(prev, next, chartMinT);
    const vRight = projectToEdge(prev, next, chartMaxT);
    if (vLeft === null || vRight === null) return null;
    return { x1: leftEdgeX, y1: toY(vLeft), x2: rightEdgeX, y2: toY(vRight) };
  };

  const gdLeftEdgeSeg = buildEdgeSeg(gdSeries, 'left');
  const gdRightEdgeSeg = buildEdgeSeg(gdSeries, 'right');
  const uniLeftEdgeSeg = buildEdgeSeg(uniSeries, 'left');
  const uniRightEdgeSeg = buildEdgeSeg(uniSeries, 'right');
  const gdPassThrough = buildPassThrough(gdSeries);
  const uniPassThrough = buildPassThrough(uniSeries);

  const summaryItems = [
    latestGD !== null ? { name: 'GreenDay', value: Math.round(latestGD), capacity: GD_CAPACITY, color: colors.gd } : null,
    latestUni !== null ? { name: 'Uni Wroc', value: Math.round(latestUni), capacity: UNI_CAPACITY, color: colors.uni } : null,
  ].filter(Boolean);

  const Container = scrollEnabled ? ScrollView : View;

  return (
    <Container style={scrollEnabled ? undefined : { flex: 1 }}>
      {/* Line chart card */}
      <View
        style={scrollEnabled
          ? { borderRadius: 12, backgroundColor: bgCard, marginBottom: 12, padding: 8 }
          : { borderRadius: 12, backgroundColor: bgCard, padding: 8, flex: 1, marginBottom: showSummary && summaryItems.length > 0 ? 12 : 0 }}
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

        {/* Chart canvas — use onLayout to get true width; swipe-enabled */}
        <View
          style={scrollEnabled
            ? { height: resolvedChartHeight, position: 'relative', overflow: 'hidden' }
            : { flex: 1, position: 'relative', overflow: 'hidden' }}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
          testID="line-chart-canvas"
          {...panResponder.panHandlers}
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
              {visibleGD.map((pt, i) => {
                if (i === 0) return null;
                const prev = visibleGD[i - 1];
                return (
                  <LineSegment
                    key={`gd-${i}`}
                    x1={toX(prev.t)} y1={toY(prev.v)}
                    x2={toX(pt.t)} y2={toY(pt.v)}
                    color={colors.gd}
                  />
                );
              })}
              {/* GreenDay edge extensions */}
              {gdLeftEdgeSeg && <LineSegment key="gd-left-edge" {...gdLeftEdgeSeg} color={colors.gd} />}
              {gdRightEdgeSeg && <LineSegment key="gd-right-edge" {...gdRightEdgeSeg} color={colors.gd} />}

              {/* Uni Wroc line segments */}
              {visibleUni.map((pt, i) => {
                if (i === 0) return null;
                const prev = visibleUni[i - 1];
                return (
                  <LineSegment
                    key={`uni-${i}`}
                    x1={toX(prev.t)} y1={toY(prev.v)}
                    x2={toX(pt.t)} y2={toY(pt.v)}
                    color={colors.uni}
                  />
                );
              })}
              {/* Uni Wroc edge extensions */}
              {uniLeftEdgeSeg && <LineSegment key="uni-left-edge" {...uniLeftEdgeSeg} color={colors.uni} />}
              {uniRightEdgeSeg && <LineSegment key="uni-right-edge" {...uniRightEdgeSeg} color={colors.uni} />}
              {/* Pass-through segments: drawn when the window falls entirely between two data points */}
              {gdPassThrough && <LineSegment key="gd-pass" {...gdPassThrough} color={colors.gd} />}
              {uniPassThrough && <LineSegment key="uni-pass" {...uniPassThrough} color={colors.uni} />}

              {/* #126: Vertical line at first zero (7–10am weekdays) */}
              {firstZero && firstZero.t >= minT && firstZero.t <= maxT && (
                <>
                  <View
                    testID="first-zero-line"
                    style={{
                      position: 'absolute',
                      left: toX(firstZero.t),
                      top: PAD.top,
                      width: 2,
                      height: cH,
                      backgroundColor: '#ef4444',
                      opacity: 0.85,
                    }}
                  />
                  <Text
                    testID="first-zero-label"
                    style={{
                      position: 'absolute',
                      left: toX(firstZero.t) - 18,
                      top: PAD.top - 10,
                      color: '#ef4444',
                      fontSize: 8,
                      fontWeight: 'bold',
                    }}
                  >
                    {fmtTime(firstZero.t)}
                  </Text>
                </>
              )}

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

        {/* Zoom controls — hour-based buttons (#133); swipe handles pan (#132) */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
          {ZOOM_HOURS.map((hours) => (
            <TouchableOpacity
              key={hours}
              onPress={() => handleZoomHours(hours)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${hours} hours`}
              style={{
                paddingHorizontal: 10, height: 28, borderRadius: 6,
                backgroundColor: zoomHours === hours ? (isDark ? '#3b82f6' : '#2563eb') : (isDark ? '#2d3b6b' : '#e2e8f0'),
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: zoomHours === hours ? '#ffffff' : (isDark ? '#e0e6ff' : '#334155'), fontSize: 12, fontWeight: '700' }}>{hours}h</Text>
            </TouchableOpacity>
          ))}
          {isZoomed && (
            <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, marginLeft: 4 }}>← swipe to pan →</Text>
          )}
        </View>
      </View>

      {/* Summary cards showing latest values */}
      {showSummary && summaryItems.length > 0 && (
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
                <View style={{ height: '100%', width: `${freePercent}%`, borderRadius: 3, backgroundColor: getFreeBarColor(freePercent) }} />
              </View>
              <Text style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: 11, marginTop: 3 }}>
                {freePercent}% free
              </Text>
            </View>
          );
        })}
      </View>
      )}
    </Container>
  );
};

export default StatisticsChart;


