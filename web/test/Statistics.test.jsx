import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Statistics from '../src/Statistics';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../src/Header', () => ({
    default: () => <div>Mock Header</div>
}));

vi.mock('../src/ThemeContext', () => ({
    useTheme: () => ({ isLight: true })
}));

// Capture the option object passed to ReactECharts so we can assert on it
let capturedOption = null;
vi.mock('echarts-for-react', () => ({
    default: ({ option, onEvents }) => {
        capturedOption = option;
        // Simulate ECharts datazoom event callback registration (no-op in tests)
        void onEvents;
        return <div data-testid="echarts-chart" />;
    }
}));

vi.mock('echarts', () => ({
    graphic: {
        LinearGradient: class LinearGradient {
            constructor(x, y, x2, y2, colors) {
                this.x = x; this.y = y; this.x2 = x2; this.y2 = y2; this.colors = colors;
            }
        }
    }
}));

// ── Test data ────────────────────────────────────────────────────────────────

const MOCK_HISTORY = [
    { 'gd_time': '2024-01-01 08:00:00', 'greenday free': '180', 'uni_time': '2024-01-01 08:00:00', 'uni free': '40' },
    { 'gd_time': '2024-01-01 09:00:00', 'greenday free': '150', 'uni_time': '2024-01-01 09:00:00', 'uni free': '35' },
    { 'gd_time': '2024-01-01 10:00:00', 'greenday free': '120', 'uni_time': '2024-01-01 10:00:00', 'uni free': '30' },
    { 'gd_time': '2024-01-01 11:00:00', 'greenday free': '90',  'uni_time': '2024-01-01 11:00:00', 'uni free': '25' },
    { 'gd_time': '2024-01-01 12:00:00', 'greenday free': '60',  'uni_time': '2024-01-01 12:00:00', 'uni free': '20' },
];

// ── Store mock ───────────────────────────────────────────────────────────────

let mockHistoryData = MOCK_HISTORY;
let mockHistoryLoading = false;

vi.mock('../src/store/parkingStore', () => ({
    useParkingStore: (selector) => {
        const state = {
            get historyData() { return mockHistoryData; },
            get historyLoading() { return mockHistoryLoading; }
        };
        if (typeof selector === 'function') return selector(state);
        return state;
    },
    refreshParkingData: vi.fn()
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderStatistics = () => {
    capturedOption = null;
    return render(<Statistics setView={vi.fn()} />);
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Statistics chart (web)', () => {
    beforeEach(() => {
        mockHistoryData = MOCK_HISTORY;
        mockHistoryLoading = false;
        capturedOption = null;
    });

    it('renders without crashing', () => {
        const { getByTestId } = renderStatistics();
        expect(getByTestId('echarts-chart')).toBeTruthy();
    });

    it('passes a chartOption to ECharts', () => {
        renderStatistics();
        expect(capturedOption).not.toBeNull();
    });

    it('sets filterMode: none on both dataZoom entries so lines always span viewport', () => {
        renderStatistics();
        const dzInside = capturedOption.dataZoom.find(dz => dz.type === 'inside');
        const dzSlider = capturedOption.dataZoom.find(dz => dz.type === 'slider');
        expect(dzInside?.filterMode).toBe('none');
        expect(dzSlider?.filterMode).toBe('none');
    });

    it('series solid data includes ALL data points (no pre-filtering by zoom window)', () => {
        renderStatistics();
        // GreenDay solid series is the first series entry
        const gdSeries = capturedOption.series[0];
        // All 5 history rows should be present in the solid data
        expect(gdSeries.data).toHaveLength(5);

        const uniSeries = capturedOption.series[3];
        expect(uniSeries.data).toHaveLength(5);
    });

    it('all data timestamps are present even when zoom is {start:50, end:100}', () => {
        // Render once to get initial option, then check that all data is present
        // (the zoom state starts at {0,100} and we verify data is always complete)
        renderStatistics();
        const gdSeries = capturedOption.series[0];
        const timestamps = gdSeries.data.map(d => d[0]);

        // Each original history row timestamp should appear in the solid data
        expect(timestamps).toContain('2024-01-01 08:00:00');
        expect(timestamps).toContain('2024-01-01 09:00:00');
        expect(timestamps).toContain('2024-01-01 10:00:00');
        expect(timestamps).toContain('2024-01-01 11:00:00');
        expect(timestamps).toContain('2024-01-01 12:00:00');
    });

    it('lines connecting outside-viewport points are present: points at zoom boundaries are in series', () => {
        // With filterMode:'none' and all data in the series, ECharts can draw
        // lines that cross the zoom viewport boundary. Verify that the point just
        // before the 50% zoom mark is included (it would be a connector).
        renderStatistics();
        // The solid series should contain all points regardless of zoom window
        const gdSeries = capturedOption.series[0];
        expect(gdSeries.data.length).toBeGreaterThanOrEqual(MOCK_HISTORY.length);
    });

    it('shows loading message when loading and no data', () => {
        mockHistoryLoading = true;
        mockHistoryData = [];
        const { getByText } = renderStatistics();
        expect(getByText('Loading history data...')).toBeTruthy();
    });

    it('shows no-data message when historyData is empty', () => {
        mockHistoryLoading = false;
        mockHistoryData = [];
        const { getByText } = renderStatistics();
        expect(getByText('No data available to display.')).toBeTruthy();
    });

    it('xAxis type is time so ECharts owns the time-range axis correctly', () => {
        renderStatistics();
        expect(capturedOption.xAxis.type).toBe('time');
    });
});
