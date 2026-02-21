import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use official Google demo banner ad unit for both platforms outside dev.
// const useTestAd = false;
// const BANNER_AD_UNIT_ID = useTestAd
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-4295926250176261/3717620167',
      android: 'ca-app-pub-4295926250176261/3717620167'
    });

const AdMobManager = ({ isLandscape, style }) => {
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

  const adSize = isLandscape ? BannerAdSize.ADAPTIVE_BANNER : BannerAdSize.BANNER;

  return (
    <View style={[isLandscape ? styles.skyscraperContainer : styles.container, style]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={adSize}
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
  skyscraperContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default AdMobManager;