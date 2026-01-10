import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import App from './src/App';

export default function Root() {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<App />
			</View>
			<View style={styles.bannerContainer}>
				<SafeAdBanner />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { flex: 1 },
	bannerContainer: {
		alignSelf: 'stretch',
	},
});

// Using Google's test banner unit ID
const BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

function SafeAdBanner() {
	return (
		<BannerAd
			unitId={BANNER_AD_UNIT_ID}
			size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
			requestOptions={{
				requestNonPersonalizedAdsOnly: true,
			}}
			onAdLoaded={() => console.log('Banner ad loaded')}
			onAdFailedToLoad={(error) => console.error('Banner ad failed:', error)}
		/>
	);
}
