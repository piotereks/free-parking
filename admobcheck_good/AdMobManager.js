import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use official Google demo banner ad unit for both platforms outside dev.
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-3940256099942544/2934735716',
      android: 'ca-app-pub-3940256099942544/6300978111'
    });

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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});

export default AdMobManager;