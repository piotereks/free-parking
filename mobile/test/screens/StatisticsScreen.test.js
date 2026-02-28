// Mock AsyncStorage before any imports
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component) => Component,
  useColorScheme: () => ({ colorScheme: 'dark', setColorScheme: jest.fn() }),
  NativeWindStyleSheet: {
    setColorScheme: jest.fn(),
    create: (styles) => styles,
  },
}));

// Mock parking-shared
jest.mock('parking-shared', () => ({
  applyApproximations: (data) => data || [],
  createParkingStore: () => {
    const useStore = (selector) => {
      const state = {
        realtimeData: [
          {
            ParkingGroupName: 'GreenDay',
            CurrentFreeGroupCounterValue: 120,
            Timestamp: '2024-01-01 12:00:00',
            approximationInfo: { isApproximated: false },
          },
          {
            ParkingGroupName: 'Bank_1',
            CurrentFreeGroupCounterValue: 25,
            Timestamp: '2024-01-01 12:00:00',
            approximationInfo: { isApproximated: false },
          },
        ],
        realtimeLoading: false,
        realtimeError: null,
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    };
    return useStore;
  },
}));

// Mock victory-native so SVG doesn't need a native renderer
jest.mock('victory-native', () => ({
  VictoryBar: () => null,
  VictoryChart: ({ children }) => children,
  VictoryTheme: { material: {} },
  VictoryAxis: () => null,
  VictoryTooltip: () => null,
  VictoryLabel: () => null,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: () => null,
  Rect: () => null,
  Text: () => null,
}));

// Mock ThemeContext
jest.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({ isDark: true, setTheme: jest.fn() }),
}));

// Mock useParkingStore
jest.mock('../../src/hooks/useParkingStore', () => {
  const useStore = (selector) => {
    const state = {
      realtimeData: [
        {
          ParkingGroupName: 'GreenDay',
          CurrentFreeGroupCounterValue: 120,
          Timestamp: '2024-01-01 12:00:00',
          approximationInfo: { isApproximated: false },
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 25,
          Timestamp: '2024-01-01 12:00:00',
          approximationInfo: { isApproximated: false },
        },
      ],
      realtimeLoading: false,
      realtimeError: null,
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

const MOCK_DATA = [
  {
    ParkingGroupName: 'GreenDay',
    CurrentFreeGroupCounterValue: 120,
    Timestamp: '2024-01-01 12:00:00',
    approximationInfo: { isApproximated: false },
  },
  {
    ParkingGroupName: 'Bank_1',
    CurrentFreeGroupCounterValue: 25,
    Timestamp: '2024-01-01 12:00:00',
    approximationInfo: { isApproximated: false },
  },
];

describe('StatisticsChart', () => {
  it('renders without crashing with valid data', () => {
    const { getByTestId } = render(<StatisticsChart data={MOCK_DATA} palette="neon" />);
    expect(getByTestId('statistics-chart')).toBeTruthy();
  });

  it('renders summary cards for each parking lot', () => {
    const { getByTestId } = render(<StatisticsChart data={MOCK_DATA} palette="neon" />);
    // GreenDay stays as-is; Bank_1 is mapped to 'Uni Wroc' by the component
    expect(getByTestId('stats-card-GreenDay')).toBeTruthy();
    expect(getByTestId('stats-card-Uni Wroc')).toBeTruthy();
  });

  it('shows "no data" message when data is empty', () => {
    const { getByText } = render(<StatisticsChart data={[]} palette="neon" />);
    expect(getByText('No data available for chart')).toBeTruthy();
  });

  it('shows "no data" message when data prop is missing', () => {
    const { getByText } = render(<StatisticsChart />);
    expect(getByText('No data available for chart')).toBeTruthy();
  });

  it('uses approximated value when approximationInfo is set', () => {
    const approxData = [
      {
        ParkingGroupName: 'GreenDay',
        CurrentFreeGroupCounterValue: 100,
        Timestamp: '2024-01-01 12:00:00',
        approximationInfo: { isApproximated: true, approximated: 110 },
      },
    ];
    const { getByText } = render(<StatisticsChart data={approxData} palette="classic" />);
    // The approximated value (110) should appear as the displayed free count
    expect(getByText('110')).toBeTruthy();
  });

  it('renders with different palettes without crashing', () => {
    const palettes = ['neon', 'classic', 'cyberpunk', 'modern'];
    palettes.forEach((p) => {
      expect(() => render(<StatisticsChart data={MOCK_DATA} palette={p} />)).not.toThrow();
    });
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

  it('renders the Statistics header title', () => {
    const { getByText } = render(<StatisticsScreen onBack={jest.fn()} />);
    expect(getByText('📈 Parking Statistics')).toBeTruthy();
  });

  it('renders palette selector buttons', () => {
    const { getByText } = render(<StatisticsScreen onBack={jest.fn()} />);
    expect(getByText('Neon')).toBeTruthy();
    expect(getByText('Classic')).toBeTruthy();
    expect(getByText('Cyber')).toBeTruthy();
    expect(getByText('Modern')).toBeTruthy();
  });
});
