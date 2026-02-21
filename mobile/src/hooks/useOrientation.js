import { useWindowDimensions } from 'react-native';

/**
 * useOrientation hook
 * Returns 'landscape' when width > height, otherwise 'portrait'.
 * Re-renders automatically when the device is rotated.
 */
export default function useOrientation() {
  const { width, height } = useWindowDimensions();
  return width > height ? 'landscape' : 'portrait';
}
