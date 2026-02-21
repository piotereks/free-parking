import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use official Google demo banner ad unit for both platforms outside dev.
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-4295926250176261/3717620167',
      android: 'ca-app-pub-4295926250176261/3717620167'
    });

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
 * AdTile — inline adaptive banner styled as a tile, for the landscape tiles row.
 * Renders an INLINE_ADAPTIVE_BANNER that fills the tile's flex-1 width.
 */
export const AdTile = () => {
  return (
    <View style={styles.adTile}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default AdMobManager;