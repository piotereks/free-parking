import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import App from './src/App';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export default function Root() {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<App />
			</View>
			<View style={styles.bannerContainer}>
				<BannerAd
					unitId="ca-app-pub-3940256099942544/9214589741"
					size={BannerAdSize.ADAPTIVE_BANNER}
				/>
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
