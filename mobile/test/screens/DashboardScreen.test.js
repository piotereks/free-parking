/**
 * Jest test suite for DashboardScreen component
 * Tests rendering, data processing, state management, and user interactions
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Mock parking-shared module
jest.mock('parking-shared', () => ({
  applyApproximations: jest.fn((data) => data),
  isValidParkingData: jest.fn((item) => Boolean(item?.ParkingGroupName)),
  normalizeParkingName: jest.fn((name) => {
    if (name === 'Bank_1') return 'Uni Wroc';
    return name || 'Unknown';
  }),
  calculateDataAge: jest.fn((timestamp, now) => {
    if (!timestamp || !now) return 0;
    const ts = new Date(timestamp);
    const diff = (now - ts) / (1000 * 60);
    return Math.floor(diff);
  }),
  formatAgeLabel: jest.fn((minutes) => ({
    display: minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} h ago`,
    aria: `${minutes} minutes ago`,
  })),
  formatTime: jest.fn((date, locale) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString(locale);
  }),
}));

// Mock ThemeContext
const mockTheme = {
  colors: {
    background: '#fff',
    text: '#000',
    border: '#eee',
  },
  isDark: false,
};

jest.mock('../../src/context/ThemeContext', () => ({
  useTheme: jest.fn(() => mockTheme),
}));

// Mock ParkingCard component
jest.mock('../../src/components/ParkingCard', () => {
  const { View, Text } = require('react-native');
  return function MockParkingCard({ data, now }) {
    return (
      <View testID={`parking-card-${data.name || data.ParkingGroupName}`}>
        <Text>{data.name || data.ParkingGroupName}</Text>
        <Text testID={`free-spaces-${data.name || data.ParkingGroupName}`}>
          {data.freeSpaces ?? data.CurrentFreeGroupCounterValue}
        </Text>
        <Text>{data.ageDisplay}</Text>
      </View>
    );
  };
});

// Mock LoadingSkeletonCard component
jest.mock('../../src/components/LoadingSkeletonCard', () => {
  const { View, Text } = require('react-native');
  return function MockLoadingSkeletonCard() {
    return (
      <View testID="loading-skeleton">
        <Text>Loading...</Text>
      </View>
    );
  };
});

// Mock Zustand store
let mockStoreState = {
  realtimeData: [],
  realtimeLoading: false,
  realtimeError: null,
  refreshCallback: null,
};

const mockStoreActions = {
  setRealtimeData: jest.fn((data) => {
    mockStoreState.realtimeData = data;
  }),
  setRealtimeLoading: jest.fn((loading) => {
    mockStoreState.realtimeLoading = loading;
  }),
  setRealtimeError: jest.fn((error) => {
    mockStoreState.realtimeError = error;
  }),
  setRefreshCallback: jest.fn((callback) => {
    mockStoreState.refreshCallback = callback;
  }),
};

jest.mock('../../src/hooks/useParkingStore', () => {
  return jest.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockStoreState);
    }
    return mockStoreState;
  });
});

import DashboardScreen from '../../src/screens/DashboardScreen';
import useParkingStore from '../../src/hooks/useParkingStore';

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock store state
    mockStoreState = {
      realtimeData: [],
      realtimeLoading: false,
      realtimeError: null,
      refreshCallback: null,
    };
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render dashboard header with title and timestamp', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Parking Dashboard')).toBeTruthy();
        expect(getByText(/Updated:/)).toBeTruthy();
      });
    });

    it('should initialize with empty state when no data available', async () => {
      mockStoreState.realtimeData = [];
      mockStoreState.realtimeLoading = false;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('No parking data available.')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should render loading skeletons when loading', async () => {
      mockStoreState.realtimeLoading = true;
      mockStoreState.realtimeData = [];

      const { getAllByTestId } = render(<DashboardScreen />);

      await waitFor(() => {
        const skeletons = getAllByTestId('loading-skeleton');
        expect(skeletons).toHaveLength(4);
      });
    });

    it('should not show loading skeletons when data is already loaded', async () => {
      mockStoreState.realtimeLoading = true;
      mockStoreState.realtimeData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      const { queryByTestId } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(queryByTestId('loading-skeleton')).toBeNull();
      });
    });
  });

  describe('Error State', () => {
    it('should render error message when error occurs', async () => {
      mockStoreState.realtimeError = 'Failed to fetch parking data';
      mockStoreState.realtimeLoading = false;
      mockStoreState.realtimeData = [];

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Error loading data. Pull to retry.')).toBeTruthy();
      });
    });

    it('should not show error when loading is in progress', async () => {
      mockStoreState.realtimeError = 'Previous error';
      mockStoreState.realtimeLoading = true;

      const { queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(queryByText('Error loading data. Pull to retry.')).toBeNull();
      });
    });
  });

  describe('Data Rendering', () => {
    it('should render parking cards with sample data', async () => {
      const sampleData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 20,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = sampleData;

      const { getByTestId, getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Green Day')).toBeTruthy();
        expect(getByText('Uni Wroc')).toBeTruthy();
        expect(getByTestId('free-spaces-Green Day').props.children).toBe(50);
        expect(getByTestId('free-spaces-Uni Wroc').props.children).toBe(20);
      });
    });

    it('should filter out invalid parking data', async () => {
      const mixedData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
        {
          // Missing ParkingGroupName - invalid
          CurrentFreeGroupCounterValue: 30,
          Timestamp: '2026-01-04T12:00:00',
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 20,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = mixedData;

      const { getByText, queryByTestId } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Green Day')).toBeTruthy();
        expect(getByText('Uni Wroc')).toBeTruthy();
        // Invalid item should not be rendered
        expect(queryByTestId('parking-card-Unknown')).toBeNull();
      });
    });

    it('should normalize parking names correctly', async () => {
      const { normalizeParkingName } = require('parking-shared');
      
      const data = [
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 20,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(normalizeParkingName).toHaveBeenCalledWith('Bank_1');
      });
    });
  });

  describe('Age Updates', () => {
    it('should update age labels every second', async () => {
      const { calculateDataAge, formatAgeLabel } = require('parking-shared');
      
      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      render(<DashboardScreen />);

      // Initial render
      await waitFor(() => {
        expect(calculateDataAge).toHaveBeenCalled();
      });

      const initialCallCount = calculateDataAge.mock.calls.length;

      // Advance timers by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should have been called again after timer tick
        expect(calculateDataAge.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('should call formatAgeLabel with calculated age', async () => {
      const { calculateDataAge, formatAgeLabel } = require('parking-shared');
      
      // Mock calculateDataAge to return specific value
      calculateDataAge.mockReturnValue(5);

      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(formatAgeLabel).toHaveBeenCalledWith(5);
      });
    });

    it('should cleanup interval on unmount', async () => {
      const { unmount } = render(<DashboardScreen />);

      const timerCount = jest.getTimerCount();

      unmount();

      // Timer should be cleared
      expect(jest.getTimerCount()).toBeLessThan(timerCount);
    });
  });

  describe('Data Processing', () => {
    it('should apply approximations to realtime data', async () => {
      const { applyApproximations } = require('parking-shared');

      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(applyApproximations).toHaveBeenCalledWith(
          data,
          expect.any(Date)
        );
      });
    });

    it('should handle non-array realtime data gracefully', async () => {
      mockStoreState.realtimeData = null;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('No parking data available.')).toBeTruthy();
      });
    });

    it('should process approximated data correctly', async () => {
      const { applyApproximations } = require('parking-shared');

      // Mock approximation logic
      applyApproximations.mockReturnValue([
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
          approximationInfo: {
            isApproximated: true,
            approximated: 45,
            original: 50,
          },
        },
      ]);

      mockStoreState.realtimeData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(applyApproximations).toHaveBeenCalled();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refreshCallback on mount if available', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);
      mockStoreState.refreshCallback = mockRefresh;

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should not crash if refreshCallback is not a function', async () => {
      mockStoreState.refreshCallback = null;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Parking Dashboard')).toBeTruthy();
      });
    });

    it('should handle refresh errors gracefully', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('Network error'));
      mockStoreState.refreshCallback = mockRefresh;

      // Should not throw
      expect(() => render(<DashboardScreen />)).not.toThrow();

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should call refreshCallback on pull-to-refresh', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);
      mockStoreState.refreshCallback = mockRefresh;
      mockStoreState.realtimeData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      const { UNSAFE_getByType } = render(<DashboardScreen />);
      const flatList = UNSAFE_getByType(require('react-native').FlatList);

      // Clear the mount call
      mockRefresh.mockClear();

      // Trigger refresh
      await act(async () => {
        flatList.props.refreshControl.props.onRefresh();
      });

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors from context', async () => {
      const { useTheme } = require('../../src/context/ThemeContext');

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(useTheme).toHaveBeenCalled();
      });
    });

    it('should log theme information for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Theme applied:',
          expect.objectContaining({
            isDark: expect.any(Boolean),
            background: expect.any(String),
            text: expect.any(String),
          })
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no data and not loading', async () => {
      mockStoreState.realtimeData = [];
      mockStoreState.realtimeLoading = false;
      mockStoreState.realtimeError = null;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('No parking data available.')).toBeTruthy();
      });
    });

    it('should not show empty state when loading', async () => {
      mockStoreState.realtimeData = [];
      mockStoreState.realtimeLoading = true;

      const { queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(queryByText('No parking data available.')).toBeNull();
      });
    });

    it('should not show empty state when error exists', async () => {
      mockStoreState.realtimeData = [];
      mockStoreState.realtimeLoading = false;
      mockStoreState.realtimeError = 'Error occurred';

      const { queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(queryByText('No parking data available.')).toBeNull();
      });
    });
  });

  describe('Data Logging', () => {
    it('should log realtime data changes for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Realtime Data:', data);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('FlatList Rendering', () => {
    it('should render FlatList with parking cards', async () => {
      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
        {
          ParkingGroupName: 'Bank_1',
          CurrentFreeGroupCounterValue: 20,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      const { UNSAFE_getByType } = render(<DashboardScreen />);
      const flatList = UNSAFE_getByType(require('react-native').FlatList);

      await waitFor(() => {
        expect(flatList).toBeTruthy();
        expect(flatList.props.data).toHaveLength(2);
      });
    });

    it('should use correct key extractor', async () => {
      const data = [
        {
          id: 'parking-1',
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      const { UNSAFE_getByType } = render(<DashboardScreen />);
      const flatList = UNSAFE_getByType(require('react-native').FlatList);

      await waitFor(() => {
        const key = flatList.props.keyExtractor(data[0], 0);
        expect(key).toBe('parking-1');
      });
    });

    it('should use index as key when id is not available', async () => {
      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      const { UNSAFE_getByType } = render(<DashboardScreen />);
      const flatList = UNSAFE_getByType(require('react-native').FlatList);

      await waitFor(() => {
        const key = flatList.props.keyExtractor(data[0], 0);
        expect(key).toBe('0');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle processing errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { applyApproximations } = require('parking-shared');

      // Make applyApproximations throw an error
      applyApproximations.mockImplementation(() => {
        throw new Error('Processing error');
      });

      mockStoreState.realtimeData = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error processing data:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle missing timestamp gracefully', async () => {
      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: 50,
          // Missing Timestamp
        },
      ];

      mockStoreState.realtimeData = data;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Green Day')).toBeTruthy();
      });
    });

    it('should handle null or undefined values in data', async () => {
      const data = [
        {
          ParkingGroupName: 'Green Day',
          CurrentFreeGroupCounterValue: null,
          Timestamp: '2026-01-04T12:00:00',
        },
      ];

      mockStoreState.realtimeData = data;

      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Green Day')).toBeTruthy();
      });
    });
  });
});
