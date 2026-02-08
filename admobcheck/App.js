import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

let AdMobManager = null;
try {
	// lazy/guarded require to avoid "runtime not ready" module-load crashes
	AdMobManager = require('./AdMobManager').default;
} catch (e) {
	// keep app alive if AdMob native module or file is missing/unready
	// eslint-disable-next-line no-console
	console.warn('AdMobManager failed to load:', e && e.message ? e.message : e);
}

function PlaceholderBanner({ style }) {
	return (
		<View style={[styles.bannerContainer, style]}>
			<View style={styles.banner}>
				<Text style={styles.bannerText}>Ad Placeholder</Text>
			</View>
		</View>
	);
}

export default function App() {
	return (
		<View style={styles.container}>
			<Text>Open up App.js to start working on your app!</Text>
			<StatusBar style="auto" />
			{AdMobManager ? <AdMobManager style={{ marginTop: 10 }} /> : <PlaceholderBanner style={{ marginTop: 10 }} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerContainer: {
		width: '100%',
		alignItems: 'center',
	},
	banner: {
		width: 320,
		height: 50,
		backgroundColor: '#f0f0f0',
		borderColor: '#ddd',
		borderWidth: 1,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerText: {
		color: '#333',
	},
});
