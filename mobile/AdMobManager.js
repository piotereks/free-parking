import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use official Google demo banner ad unit for both platforms outside dev.
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-4295926250176261/3717620167',
      android: 'ca-app-pub-4295926250176261/3717620167'
    });

// Maximum fraction of screen width that the ad tile may occupy
export const AD_TILE_MAX_WIDTH_RATIO = 0.4;

/**
 * AdMobManager — bottom banner (portrait)
 */
const AdMobManager = ({ style }) => {
  useEffect(() => {
    try {
      mobileAds().initialize().then(() => {
        console.log('AdMob initialized successfully');
      }).catch((initError) => {
        console.warn('AdMob initialization failed:', initError);
      });
    } catch (e) {
      console.warn('AdMob initialization threw an error:', e);
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
};

/**
 * AdTile — inline adaptive banner for the landscape tiles row.
 * Container width is capped at 2/5 (40%) of the screen width so parking tiles
 * always have the majority of the row. Height adapts to the loaded ad.
 * While loading, a minimum placeholder size is used so the layout doesn't jump.
 */
export const AdTile = () => {
  const { width: screenWidth } = useWindowDimensions();
  const maxTileWidth = Math.floor(screenWidth * AD_TILE_MAX_WIDTH_RATIO);
  const [adSize, setAdSize] = useState(null);

  const handleAdSize = ({ width, height }) => {
    setAdSize({ width, height });
  };

  const containerWidth = adSize ? Math.min(adSize.width, maxTileWidth) : undefined;
  const containerHeight = adSize ? adSize.height : undefined;

  return (
    <View style={[
      styles.adTile,
      adSize
        ? { width: containerWidth, height: containerHeight }
        : [styles.adTilePlaceholder, { maxWidth: maxTileWidth }],
    ]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={handleAdSize}
        onSizeChange={handleAdSize}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  adTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  adTilePlaceholder: {
    // Minimum footprint while ad is loading — avoids a layout hole
    minWidth: 100,
    minHeight: 50,
  },
});

export default AdMobManager;