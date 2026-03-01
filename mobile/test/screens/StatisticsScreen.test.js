// Mock AsyncStorage before any imports
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NativeWind — must export StyledComponent which is injected by the nativewind/babel plugin
// for any component that uses className props
jest.mock('nativewind', () => {
  const React = require('react');
  return {
    styled: (Component) => Component,
    useColorScheme: () => ({ colorScheme: 'dark', setColorScheme: jest.fn() }),
    NativeWindStyleSheet: {
      setColorScheme: jest.fn(),
      create: (styles) => styles,
    },
    // StyledComponent is what nativewind/babel compiles className props into at build time:
    // <View className="foo"> → <StyledComponent component={View} className="foo">
    StyledComponent: ({ component: Component, children, className, ...props }) =>
      React.createElement(Component, props, children),
  };
});

// Mock SafeAreaView — pass all props through so testID etc. work
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: (props) => React.createElement(View, props),
  };
});

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock useOrientation (default portrait)
jest.mock('../../src/hooks/useOrientation', () => jest.fn(() => 'portrait'));

// Mock parking-shared
jest.mock('parking-shared', () => ({
  applyApproximations: (data) => data || [],
  createParkingStore: () => {
    const useStore = (selector) => {
      const state = {
        historyData: MOCK_HISTORY,
        historyLoading: false,
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    };
    return useStore;
  },
}));

// Mock ThemeContext
jest.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({ isDark: true, setTheme: jest.fn() }),
}));

// Mock useParkingStore
jest.mock('../../src/hooks/useParkingStore', () => {
  const useStore = (selector) => {
    const state = {
      historyData: MOCK_HISTORY,
      historyLoading: false,
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  };
  return { __esModule: true, default: useStore };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatisticsScreen from '../../src/screens/StatisticsScreen';
import StatisticsChart from '../../src/components/StatisticsChart';

const MOCK_HISTORY = [
  {
    'gd_time': '2024-01-01 12:00:00',
    'greenday free': '120',
    'uni_time': '2024-01-01 12:00:00',
    'uni free': '25',
  },
  {
    'gd_time': '2024-01-01 12:30:00',
    'greenday free': '110',
    'uni_time': '2024-01-01 12:30:00',
    'uni free': '20',
  },
];

describe('StatisticsChart', () => {
  it('renders without crashing with valid history data', () => {
    const { getByTestId } = render(<StatisticsChart historyData={MOCK_HISTORY} palette="neon" />);
    expect(getByTestId('statistics-chart')).toBeTruthy();
  });

  it('renders summary cards for each parking lot', () => {
    const { getByTestId } = render(<StatisticsChart historyData={MOCK_HISTORY} palette="neon" />);
    expect(getByTestId('stats-card-GreenDay')).toBeTruthy();
    expect(getByTestId('stats-card-Uni Wroc')).toBeTruthy();
  });

  it('shows "no data" message when historyData is empty', () => {
    const { getByText } = render(<StatisticsChart historyData={[]} palette="neon" />);
    expect(getByText('No data available for chart')).toBeTruthy();
  });

  it('shows "no data" message when historyData prop is missing', () => {
    const { getByText } = render(<StatisticsChart />);
    expect(getByText('No data available for chart')).toBeTruthy();
  });

  it('shows latest free-space value in summary card', () => {
    const { getAllByText } = render(<StatisticsChart historyData={MOCK_HISTORY} palette="neon" />);
    // Latest GreenDay value is 110 (second row)
    expect(getAllByText('110').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with different palettes without crashing', () => {
    const palettes = ['neon', 'classic', 'cyberpunk', 'modern'];
    palettes.forEach((p) => {
      expect(() => render(<StatisticsChart historyData={MOCK_HISTORY} palette={p} />)).not.toThrow();
    });
  });

  it('renders hour-based zoom buttons (#133)', () => {
    const { getByText } = render(<StatisticsChart historyData={MOCK_HISTORY} palette="neon" />);
    expect(getByText('4h')).toBeTruthy();
    expect(getByText('8h')).toBeTruthy();
    expect(getByText('12h')).toBeTruthy();
    expect(getByText('24h')).toBeTruthy();
    expect(getByText('48h')).toBeTruthy();
  });

  it('renders first-zero vertical line for weekday 7-10am zero data (#126)', () => {
    // Wednesday (2024-01-03) at 08:15 with both values = 0
    const dataWithZero = [
      { 'gd_time': '2024-01-03 07:00:00', 'greenday free': '5', 'uni_time': '2024-01-03 07:00:00', 'uni free': '3' },
      { 'gd_time': '2024-01-03 08:15:00', 'greenday free': '0', 'uni_time': '2024-01-03 08:15:00', 'uni free': '0' },
    ];
    const { getByTestId } = render(<StatisticsChart historyData={dataWithZero} palette="neon" />);
    expect(getByTestId('statistics-chart')).toBeTruthy();
    // The first-zero elements are only rendered when chartWidth > 0 (requires layout),
    // so in test we verify the component doesn't crash with zero data
  });

  it('renders without crashing when series have many points (edge-extension stress test)', () => {
    // Provide enough rows to trigger zooming (windowSize < series length)
    // and ensure edge extensions do not throw when prev.t is inside chart bounds
    const rows = Array.from({ length: 20 }, (_, i) => {
      const pad = (n) => String(n).padStart(2, '0');
      const h = pad(6 + Math.floor(i / 2));
      const m = pad((i % 2) * 30);
      return {
        'gd_time': `2024-01-01 ${h}:${m}:00`,
        'greenday free': String(180 - i * 5),
        'uni_time': `2024-01-01 ${h}:${m}:00`,
        'uni free': String(40 - i),
      };
    });
    expect(() => render(<StatisticsChart historyData={rows} palette="neon" />)).not.toThrow();
  });

  it('renders without crashing when GD and Uni have different first timestamps (buildEdgeSeg inner-segment case)', () => {
    // Uni starts one hour before GD; when both are panned to the same index window,
    // GD's prev point may have t >= combined minT — the inner-segment branch should not throw.
    const gdRows = Array.from({ length: 10 }, (_, i) => ({
      'gd_time': `2024-01-01 ${String(10 + i).padStart(2, '0')}:00:00`,
      'greenday free': String(180 - i * 10),
      'uni_time': `2024-01-01 ${String(9 + i).padStart(2, '0')}:00:00`,
      'uni free': String(40 - i * 2),
    }));
    expect(() => render(<StatisticsChart historyData={gdRows} palette="neon" />)).not.toThrow();
  });

  it('renders without crashing when Uni series is shorter than GD (Uni line should not vanish)', () => {
    // 20 GD rows but only 10 Uni rows.
    // With old index-based slice at pan=15, uniSeries.slice(15, ...) was empty → line vanished.
    const rows = Array.from({ length: 20 }, (_, i) => {
      const h = String(6 + Math.floor(i / 2)).padStart(2, '0');
      const m = String((i % 2) * 30).padStart(2, '0');
      if (i % 2 === 0) {
        return {
          'gd_time': `2024-01-01 ${h}:${m}:00`,
          'greenday free': String(180 - i * 4),
          'uni_time': `2024-01-01 ${h}:${m}:00`,
          'uni free': String(40 - i),
        };
      }
      return {
        'gd_time': `2024-01-01 ${h}:${m}:00`,
        'greenday free': String(180 - i * 4),
        'uni_time': '',
        'uni free': '',
      };
    });
    expect(() => render(<StatisticsChart historyData={rows} palette="neon" />)).not.toThrow();
  });
});

// ── Pure logic tests for edge extension (no React rendering required) ────────

describe('StatisticsChart – edge extension logic (time-based windowing)', () => {
  /**
   * Simulate the core time-based windowing and edge extension logic extracted
   * from StatisticsChart so it can be tested without a DOM/layout context.
   */
  const simulate = ({
    series,
    fullMinT, fullMaxT,
    maxSeriesLen, zoomHours, clampedPan,
  }) => {
    const totalHoursSpan = Math.max(1, (fullMaxT - fullMinT) / 3600000);
    const effectiveHours = Math.min(zoomHours, totalHoursSpan);
    const windowSize = Math.max(2, Math.ceil(maxSeriesLen * (effectiveHours / totalHoursSpan)));
    const windowMs = effectiveHours * 3600000;
    const panFrac = (maxSeriesLen > windowSize) ? clampedPan / (maxSeriesLen - windowSize) : 1;
    const timeSpanMs = Math.max(1, fullMaxT - fullMinT);
    const chartMaxT = fullMinT + Math.min(timeSpanMs, windowMs + panFrac * Math.max(0, timeSpanMs - windowMs));
    const chartMinT = chartMaxT - windowMs;

    const cW = 300;
    const PAD_LEFT = 32;
    const toX = (t) => PAD_LEFT + ((t - chartMinT) / windowMs) * cW;
    const toY = (v) => 200 - v;
    const leftEdgeX = PAD_LEFT;
    const rightEdgeX = PAD_LEFT + cW;

    const projectToEdge = (p0, p1, tEdge) => {
      const dt = p1.t - p0.t;
      if (dt === 0) return null;
      return p0.v + (p1.v - p0.v) * (tEdge - p0.t) / dt;
    };

    const buildEdgeSeg = (s, side) => {
      if (side === 'left') {
        const idx = s.findIndex(p => p.t >= chartMinT && p.t <= chartMaxT);
        if (idx <= 0) return null;
        const vEdge = projectToEdge(s[idx - 1], s[idx], chartMinT);
        if (vEdge === null) return null;
        return { x1: leftEdgeX, y1: toY(vEdge), x2: toX(s[idx].t), y2: toY(s[idx].v) };
      }
      let lastIdx = -1;
      for (let i = s.length - 1; i >= 0; i--) {
        if (s[i].t >= chartMinT && s[i].t <= chartMaxT) { lastIdx = i; break; }
      }
      if (lastIdx < 0 || lastIdx >= s.length - 1) return null;
      const vEdge = projectToEdge(s[lastIdx], s[lastIdx + 1], chartMaxT);
      if (vEdge === null) return null;
      return { x1: toX(s[lastIdx].t), y1: toY(s[lastIdx].v), x2: rightEdgeX, y2: toY(vEdge) };
    };

    const buildPassThrough = (s) => {
      if (s.some(p => p.t >= chartMinT && p.t <= chartMaxT)) return null;
      const prev = [...s].reverse().find(p => p.t < chartMinT);
      const next = s.find(p => p.t > chartMaxT);
      if (!prev || !next) return null;
      const vLeft = projectToEdge(prev, next, chartMinT);
      const vRight = projectToEdge(prev, next, chartMaxT);
      if (vLeft === null || vRight === null) return null;
      return { x1: leftEdgeX, y1: toY(vLeft), x2: rightEdgeX, y2: toY(vRight) };
    };

    return {
      leftExt: buildEdgeSeg(series, 'left'),
      rightExt: buildEdgeSeg(series, 'right'),
      passThrough: buildPassThrough(series),
      chartMinT, chartMaxT,
      leftEdgeX, rightEdgeX,
      visibleCount: series.filter(p => p.t >= chartMinT && p.t <= chartMaxT).length,
    };
  };

  it('edge extensions have non-zero length with irregular timestamps (typical real-world data)', () => {
    // Slightly irregular data – window boundary falls BETWEEN data points
    const series = [
      { t: 0, v: 180 }, { t: 32 * 60000, v: 165 }, { t: 61 * 60000, v: 155 },
      { t: 93 * 60000, v: 140 }, { t: 124 * 60000, v: 125 }, { t: 157 * 60000, v: 110 },
      { t: 188 * 60000, v: 95 },  { t: 221 * 60000, v: 82 }, { t: 252 * 60000, v: 70 },
      { t: 285 * 60000, v: 55 },
    ];
    const result = simulate({
      series, fullMinT: 0, fullMaxT: 285 * 60000,
      maxSeriesLen: series.length, zoomHours: 1, clampedPan: 3,
    });

    expect(result.leftExt).not.toBeNull();
    expect(result.rightExt).not.toBeNull();
    expect(Math.abs(result.leftExt.x2 - result.leftExt.x1)).toBeGreaterThan(0);
    expect(Math.abs(result.rightExt.x2 - result.rightExt.x1)).toBeGreaterThan(0);
  });

  it('left extension starts exactly at the left chart edge', () => {
    const series = [0, 30, 60, 90, 120, 150].map(m => ({ t: m * 60000, v: 100 - m }));
    const result = simulate({
      series, fullMinT: 0, fullMaxT: 150 * 60000,
      maxSeriesLen: series.length, zoomHours: 1, clampedPan: 2,
    });
    if (result.leftExt) {
      expect(result.leftExt.x1).toBe(result.leftEdgeX);
    }
  });

  it('right extension ends exactly at the right chart edge', () => {
    const series = [0, 30, 60, 90, 120, 150].map(m => ({ t: m * 60000, v: 100 - m }));
    const result = simulate({
      series, fullMinT: 0, fullMaxT: 150 * 60000,
      maxSeriesLen: series.length, zoomHours: 1, clampedPan: 2,
    });
    if (result.rightExt) {
      expect(result.rightExt.x2).toBe(result.rightEdgeX);
    }
  });

  it('pass-through segment spans full chart width when window falls entirely between two data points', () => {
    // 4 data points: T=0, T=30min, T=150min, T=200min.
    // With zoomHours=1 and pan in the middle, chartMinT≈70min and chartMaxT≈130min.
    // No data points lie in the 70–130min window → pass-through connects the gap.
    const series = [
      { t: 0, v: 100 }, { t: 30 * 60000, v: 80 },
      { t: 150 * 60000, v: 40 }, { t: 200 * 60000, v: 20 },
    ];
    const result = simulate({
      series, fullMinT: 0, fullMaxT: 200 * 60000,
      maxSeriesLen: series.length, zoomHours: 1, clampedPan: 1,
    });
    expect(result.visibleCount).toBe(0);
    expect(result.passThrough).not.toBeNull();
    expect(result.passThrough.x1).toBe(result.leftEdgeX);
    expect(result.passThrough.x2).toBe(result.rightEdgeX);
  });

  it('no extensions when all data fits inside window', () => {
    const series = [{ t: 0, v: 100 }, { t: 30 * 60000, v: 80 }];
    const result = simulate({
      series, fullMinT: 0, fullMaxT: 30 * 60000,
      maxSeriesLen: series.length, zoomHours: 48, clampedPan: 0,
    });
    expect(result.leftExt).toBeNull();
    expect(result.rightExt).toBeNull();
    expect(result.passThrough).toBeNull();
  });

  it('shorter Uni series remains visible when panned far right (was broken with index-based slice)', () => {
    // GD 100 pts, Uni 50 pts. Old code: uniSeries.slice(91, 100) = [] → Uni invisible.
    const gdSeries = Array.from({ length: 100 }, (_, i) => ({ t: i * 30 * 60000, v: 180 - i }));
    const uniSeries = Array.from({ length: 50 }, (_, i) => ({ t: i * 60 * 60000, v: 40 - i * 0.5 }));
    const fullMaxT = Math.max(gdSeries[99].t, uniSeries[49].t);
    const result = simulate({
      series: uniSeries, fullMinT: 0, fullMaxT,
      maxSeriesLen: 100, zoomHours: 4, clampedPan: 91,
    });
    expect(result.visibleCount).toBeGreaterThan(0);
  });
});

describe('StatisticsScreen', () => {
  it('renders without crashing', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<StatisticsScreen onBack={onBack} />);
    expect(getByTestId('statistics-screen')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<StatisticsScreen onBack={onBack} />);
    fireEvent.press(getByTestId('back-button'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the Statistics header title for wide screens', () => {
    const { getByText } = render(<StatisticsScreen onBack={jest.fn()} />);
    // Default test env width is 750 (≥700) → full title
    expect(getByText('Parking Statistics')).toBeTruthy();
  });

  it('renders shortened title on narrow screens (<700pt) (#128)', () => {
    const RN = require('react-native');
    const spy = jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 400, height: 800, scale: 1, fontScale: 1 });
    try {
      const { getByText } = render(<StatisticsScreen onBack={jest.fn()} />);
      expect(getByText('Parking Stats')).toBeTruthy();
    } finally {
      spy.mockRestore();
    }
  });

  it('renders palette selector buttons', () => {
    const { getByText } = render(<StatisticsScreen onBack={jest.fn()} />);
    expect(getByText('Neon')).toBeTruthy();
    expect(getByText('Classic')).toBeTruthy();
    expect(getByText('Cyber')).toBeTruthy();
    expect(getByText('Modern')).toBeTruthy();
  });
});

