import React, { useEffect, useRef, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import mobileAds, {
  NativeAdView,
  CallToActionView,
  HeadlineView,
  TaglineView,
  IconView,
  MediaView,
  StarRatingView,
  TestIds
} from 'react-native-google-mobile-ads';

// Use official Google demo native ad unit for both platforms outside dev.
const NATIVE_AD_UNIT_ID = __DEV__
  ? TestIds.NATIVE_ADVANCED
  : Platform.select({
      ios: 'ca-app-pub-3940256099942544/2247696110',
      android: 'ca-app-pub-3940256099942544/2247696110'
    });

const AdMobManager = ({ style }) => {
  const adRef = useRef(null);

  useEffect(() => {
    mobileAds().initialize();
  }, []);

  const handleAdFailedToLoad = useCallback((error) => {
    console.warn('Native ad failed to load:', error);
  }, []);

  return (
    <NativeAdView
      ref={adRef}
      adUnitID={NATIVE_AD_UNIT_ID}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      onAdFailedToLoad={handleAdFailedToLoad}
      style={style}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconView style={styles.icon} />
          <View style={styles.titles}>
            <HeadlineView style={styles.headline} />
            <TaglineView style={styles.tagline} />
          </View>
        </View>

        <MediaView style={styles.media} />

        <View style={styles.footer}>
          <StarRatingView style={styles.stars} />
          <CallToActionView style={styles.cta} textStyle={styles.ctaText} />
        </View>
      </View>
    </NativeAdView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f1f1f1'
  },
  titles: {
    flex: 1
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111'
  },
  tagline: {
    fontSize: 13,
    color: '#555',
    marginTop: 4
  },
  media: {
    height: 200,
    backgroundColor: '#f7f7f7'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 10
  },
  stars: {
    width: 120,
    height: 20
  },
  cta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 6
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default AdMobManager;