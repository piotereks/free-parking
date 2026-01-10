import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
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

// Test banner unit ID (Google's demo ad unit for testing)
const BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

function SafeAdBanner() {
	const [AdMobBanner, setAdMobBanner] = useState(null);
	const [setTestDeviceIDAsync, setTestDeviceAsync] = useState(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Check if running in Expo Go
		const isExpoGo = Constants.appOwnership === 'expo';
		
		if (isExpoGo) {
			console.log('Running in Expo Go - AdMob unavailable');
			console.log('Build a standalone app or dev client to see ads');
			setIsReady(true);
			return;
		}

		// Try to load expo-ads-admob dynamically
		const loadAdMob = async () => {
			try {
				const admob = require('expo-ads-admob');
				setAdMobBanner(() => admob.AdMobBanner);
				setTestDeviceAsync(() => admob.setTestDeviceIDAsync);
				
				// Set up test device
				try {
					await admob.setTestDeviceIDAsync('EMULATOR');
					console.log('AdMob test mode enabled');
				} catch (e) {
					console.warn('Test device setup failed:', e.message);
				}
				
				setIsReady(true);
			} catch (error) {
				console.error('expo-ads-admob not available:', error.message);
				setIsReady(true);
			}
		};

		loadAdMob();
	}, []);

	if (!isReady || !AdMobBanner) {
		// Show placeholder in Expo Go
		if (Constants.appOwnership === 'expo') {
			return (
				<View style={{ padding: 8, backgroundColor: '#333', alignItems: 'center' }}>
					<Text style={{ color: '#888', fontSize: 11 }}>
						[AdMob Banner - requires standalone build]
					</Text>
				</View>
			);
		}
		return null;
	}

	return (
		<AdMobBanner
			bannerSize="smartBannerPortrait"
			adUnitID={BANNER_AD_UNIT_ID}
			servePersonalizedAds={false}
			onDidFailToReceiveAdWithError={(error) => {
				console.error('Banner Ad Error:', error);
			}}
			onAdViewDidReceiveAd={() => {
				console.log('Banner ad loaded successfully');
			}}
		/>
	);
}
