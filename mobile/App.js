import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import App from './src/App';


let AdMobManager = null;
try {
  // Lazy/guarded require to avoid "runtime not ready" module-load crashes
  AdMobManager = require('./AdMobManager').default;
} catch (e) {
  console.warn('AdMobManager failed to load:', e && e.message ? e.message : e);
}

/**
 * PlaceholderBanner Component
 * Displays a placeholder when AdMob is not available (portrait only).
 */
function PlaceholderBanner({ style }) {
  return (
    <View style={[styles.bannerContainer, style]}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Ad Placeholder</Text>
      </View>
    </View>
  );
}

/**
 * Root Component
 * App entry point with SafeAreaView and AdMob banner.
 * - Portrait: banner at the bottom (horizontal strip)
 * - Landscape: ad tile is rendered inside the tiles row (see src/App.js); no bottom banner
 */
export default function Root() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <App />
      </View>
      {/* Bottom banner — portrait only; landscape uses inline ad tile inside src/App.js */}
      {!isLandscape && (
        <View style={styles.bannerContainer}>
          {AdMobManager ? (
            <AdMobManager style={{ marginTop: 10 }} />
          ) : (
            <PlaceholderBanner style={{ marginTop: 10 }} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    alignSelf: 'stretch',
  },
  banner: {
    width: 320,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#333',
  },
});