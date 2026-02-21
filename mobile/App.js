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
 * Displays a placeholder when AdMob is not available.
 * In landscape: a narrow full-height column on the left.
 * In portrait: standard horizontal banner strip.
 */
function PlaceholderBanner({ isLandscape, style }) {
  return (
    <View style={[isLandscape ? styles.skyscraperContainer : styles.bannerContainer, style]}>
      <View style={isLandscape ? styles.skyscraper : styles.banner}>
        <Text style={styles.bannerText}>{isLandscape ? 'Ad' : 'Ad Placeholder'}</Text>
      </View>
    </View>
  );
}

/**
 * Root Component
 * App entry point with SafeAreaView and AdMob banner.
 * - Portrait: banner at the bottom (horizontal strip, BANNER format)
 * - Landscape: banner on the left (full-height column, ADAPTIVE_BANNER format)
 */
export default function Root() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <SafeAreaView style={[styles.container, isLandscape && styles.containerRow]}>
      {/* Skyscraper ad on the left — landscape only */}
      {isLandscape && (
        <View style={styles.skyscraperContainer}>
          {AdMobManager ? (
            <AdMobManager isLandscape />
          ) : (
            <PlaceholderBanner isLandscape />
          )}
        </View>
      )}

      <View style={styles.content}>
        <App />
      </View>

      {/* Bottom banner — portrait only */}
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
  containerRow: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    alignSelf: 'stretch',
  },
  skyscraperContainer: {
    width: 160,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
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
  skyscraper: {
    width: 160,
    flex: 1,
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