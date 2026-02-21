import useOrientation from '../src/hooks/useOrientation';

let mockDimensions = { width: 360, height: 800 };

jest.mock('react-native', () => ({
  useWindowDimensions: () => mockDimensions,
}));

describe('useOrientation', () => {
  it('returns "portrait" when height > width', () => {
    mockDimensions = { width: 360, height: 800 };
    expect(useOrientation()).toBe('portrait');
  });

  it('returns "landscape" when width > height', () => {
    mockDimensions = { width: 800, height: 360 };
    expect(useOrientation()).toBe('landscape');
  });

  it('returns "portrait" when width equals height', () => {
    mockDimensions = { width: 500, height: 500 };
    expect(useOrientation()).toBe('portrait');
  });
});
