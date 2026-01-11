import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform, Alert } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedInterstitialAd,
  RewardedAdEventType
} from 'react-native-google-mobile-ads';

// Test Ad Unit IDs - automatically handled by library in dev mode
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxx/yyy';
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxx/yyy';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : 'ca-app-pub-xxx/yyy';

const interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId);
const rewardedAd = RewardedInterstitialAd.createForAdRequest(rewardedAdUnitId);

const AdMobManager = ({ style }) => {
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [bannerError, setBannerError] = useState(null);

  useEffect(() => {
    // Load interstitial ad
    const unsubscribeInterstitialLoaded = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('[AdMob] Interstitial loaded');
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeInterstitialClosed = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('[AdMob] Interstitial closed');
        setInterstitialLoaded(false);
        interstitialAd.load();
      }
    );

    const unsubscribeInterstitialError = interstitialAd.addAdEventListener(
      AdEventType.ERROR,
      error => {
        console.error('[AdMob] Interstitial error:', error);
        setInterstitialLoaded(false);
      }
    );

    // Load rewarded ad
    const unsubscribeRewardedLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('[AdMob] Rewarded ad loaded');
        setRewardedLoaded(true);
      }
    );

    const unsubscribeRewardedClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('[AdMob] Rewarded ad closed');
        setRewardedLoaded(false);
        rewardedAd.load();
      }
    );

    const unsubscribeRewardedError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      error => {
        console.error('[AdMob] Rewarded error:', error);
        setRewardedLoaded(false);
      }
    );

    const unsubscribeRewardedEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('[AdMob] User earned reward:', reward);
        Alert.alert('Reward Earned', `You earned ${reward.amount} ${reward.type}!`);
      }
    );

    console.log('[AdMob] Initializing ads...');
    interstitialAd.load();
    rewardedAd.load();

    return () => {
      unsubscribeInterstitialLoaded();
      unsubscribeInterstitialClosed();
      unsubscribeInterstitialError();
      unsubscribeRewardedLoaded();
      unsubscribeRewardedClosed();
      unsubscribeRewardedError();
      unsubscribeRewardedEarned();
    };
  }, []);

  const handleShowInterstitial = async () => {
    if (interstitialLoaded) {
      await interstitialAd.show();
    } else {
      Alert.alert('Not Ready', 'Interstitial ad is still loading');
    }
  };

  const handleShowRewarded = async () => {
    if (rewardedLoaded) {
      await rewardedAd.show();
    } else {
      Alert.alert('Not Ready', 'Rewarded ad is still loading');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>AdMob Manager</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Banner Ad:</Text>
        {bannerError && <Text style={styles.error}>{bannerError}</Text>}
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdFailedToLoad={error => {
            console.error('[AdMob] Banner error:', error);
            setBannerError('Failed to load banner');
          }}
          onAdLoaded={() => {
            console.log('[AdMob] Banner loaded');
            setBannerError(null);
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Interstitial Ad:</Text>
        <Button
          title={interstitialLoaded ? 'Show Interstitial' : 'Loading...'}
          onPress={handleShowInterstitial}
          disabled={!interstitialLoaded}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Rewarded Ad:</Text>
        <Button
          title={rewardedLoaded ? 'Show Rewarded Ad' : 'Loading...'}
          onPress={handleShowRewarded}
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
  section: {
    marginVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
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
