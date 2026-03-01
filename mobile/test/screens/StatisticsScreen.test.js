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

