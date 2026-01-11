import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial,
  AdMobRewarded,
  setTestDeviceIDAsync
} from 'expo-ads-admob';

// Define your ad unit IDs
const BANNER_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-xxx/yyy',
  android: 'ca-app-pub-xxx/yyy'
});

const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-xxx/yyy',
  android: 'ca-app-pub-xxx/yyy'
});

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-xxx/yyy',
  android: 'ca-app-pub-xxx/yyy'
});

const AdMobManager = ({ style }) => {
  const [isTestMode, setIsTestMode] = useState(true);

  useEffect(() => {
    // Set up test devices during development
    const setupTestDevices = async () => {
      if (isTestMode) {
        await setTestDeviceIDAsync('EMULATOR');
      }
    };

    setupTestDevices();
  }, [isTestMode]);

  // Banner Ad Component
  const BannerAdComponent = () => (
    <AdMobBanner
      bannerSize="smartBannerPortrait"
      adUnitID={BANNER_AD_UNIT_ID}
      servePersonalizedAds={true}
      onAdFailedToLoad={(error) => console.error('Banner Ad Error:', error)}
    />
  );

  // Interstitial Ad Loading and Showing
  const loadInterstitial = async () => {
    try {
      await AdMobInterstitial.setAdUnitID(INTERSTITIAL_AD_UNIT_ID);
      await AdMobInterstitial.requestAdAsync();
      await AdMobInterstitial.showAdAsync();
    } catch (error) {
      console.error('Interstitial Ad Error:', error);
    }
  };

  // Rewarded Ad Loading and Showing
  const loadRewardedAd = async () => {
    try {
      await AdMobRewarded.setAdUnitID(REWARDED_AD_UNIT_ID);
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
    } catch (error) {
      console.error('Rewarded Ad Error:', error);
    }
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <BannerAdComponent />
    </View>
  );
};

export default AdMobManager;