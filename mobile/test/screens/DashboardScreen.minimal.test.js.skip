// Minimal test to debug the Object.create issue

jest.mock('../../src/config/debug', () => ({
  debugLog: jest.fn(),
}));

jest.mock('parking-shared', () => ({
  applyApproximations: jest.fn((data) => data),
  isValidParkingData: jest.fn(() => true),
  normalizeParkingName: jest.fn((name) => name),
  calculateDataAge: jest.fn(() => 5),
  formatAgeLabel: jest.fn(() => ({ display: '5 min', aria: '5 min' })),
  formatTime: jest.fn(() => '12:00'),
}));

jest.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000' },
    isDark: false,
  }),
}));

jest.mock('../../src/components/ParkingCard', () => {
  return () => null;
});

jest.mock('../../src/components/LoadingSkeletonCard', () => {
  return () => null;
});

jest.mock('../../src/hooks/useParkingStore', () => {
  return jest.fn(() => []);
});

describe('DashboardScreen minimal', () => {
  it('should import without crashing', () => {
    const DashboardScreen = require('../../src/screens/DashboardScreen').default;
    expect(DashboardScreen).toBeDefined();
  });
});
