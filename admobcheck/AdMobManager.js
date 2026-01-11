import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import MobileAds, { 
  BannerAd, 
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType
} from 'react-native-google-mobile-ads';

// Use Google's test ad unit IDs for development
const BANNER_AD_UNIT_ID = __DEV__ 
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-YOUR_IOS_BANNER_ID',
      android: 'ca-app-pub-YOUR_ANDROID_BANNER_ID'
    });

const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-YOUR_IOS_INTERSTITIAL_ID',
      android: 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_ID'
    });

const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: 'ca-app-pub-YOUR_IOS_REWARDED_ID',
      android: 'ca-app-pub-YOUR_ANDROID_REWARDED_ID'
    });

// Initialize interstitial ad
const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);

// Initialize rewarded ad
const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

const AdMobManager = ({ style }) => {
  const [initialized, setInitialized] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);

  useEffect(() => {
    // Initialize Google Mobile Ads SDK
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialized', adapterStatuses);
        setInitialized(true);
      })
      .catch(error => {
        console.error('AdMob initialization error:', error);
      });

    // Setup interstitial ad listeners
    const unsubscribeInterstitialLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Interstitial loaded');
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeInterstitialClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Interstitial closed');
        setInterstitialLoaded(false);
        interstitial.load(); // Reload ad
      }
    );

    const unsubscribeInterstitialError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Interstitial error:', error);
        setInterstitialLoaded(false);
      }
    );

    // Setup rewarded ad listeners
    const unsubscribeRewardedLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('Rewarded ad loaded');
        setRewardedLoaded(true);
      }
    );

    const unsubscribeRewardedEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward:', reward);
      }
    );

    const unsubscribeRewardedClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Rewarded ad closed');
        setRewardedLoaded(false);
        rewarded.load(); // Reload ad
      }
    );

    const unsubscribeRewardedError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Rewarded ad error:', error);
        setRewardedLoaded(false);
      }
    );

    // Load ads
    interstitial.load();
    rewarded.load();

    // Cleanup
    return () => {
      unsubscribeInterstitialLoaded();
      unsubscribeInterstitialClosed();
      unsubscribeInterstitialError();
      unsubscribeRewardedLoaded();
      unsubscribeRewardedEarned();
      unsubscribeRewardedClosed();
      unsubscribeRewardedError();
    };
  }, []);

  const showInterstitial = () => {
    if (interstitialLoaded) {
      interstitial.show();
    } else {
      console.log('Interstitial not loaded yet');
    }
  };

  const showRewarded = () => {
    if (rewardedLoaded) {
      rewarded.show();
    } else {
      console.log('Rewarded ad not loaded yet');
    }
  };

  if (!initialized) {
    return (
      <View style={[styles.container, style]}>
        <Text>Initializing AdMob...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>AdMob Manager</Text>
      
      {/* Banner Ad */}
      <View style={styles.adSection}>
        <Text style={styles.label}>Banner Ad:</Text>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdFailedToLoad={(error) => {
            console.error('Banner ad failed to load:', error);
          }}
          onAdLoaded={() => {
            console.log('Banner ad loaded');
          }}
        />
      </View>

      {/* Interstitial Ad */}
      <View style={styles.adSection}>
        <Text style={styles.label}>Interstitial Ad:</Text>
        <Button
          title={interstitialLoaded ? "Show Interstitial" : "Loading..."}
          onPress={showInterstitial}
          disabled={!interstitialLoaded}
        />
      </View>

      {/* Rewarded Ad */}
      <View style={styles.adSection}>
        <Text style={styles.label}>Rewarded Ad:</Text>
        <Button
          title={rewardedLoaded ? "Show Rewarded Ad" : "Loading..."}
          onPress={showRewarded}
          disabled={!rewardedLoaded}
        />
      </View>

      <Text style={styles.info}>
        {__DEV__ ? '⚠️ Using TEST ads (dev mode)' : '✅ Using PRODUCTION ads'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  adSection: {
    marginVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  info: {
    marginTop: 15,
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
});

export default AdMobManager;