import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

export default function App() {
  const [adModule, setAdModule] = useState(null);

  useEffect(() => {
    let mounted = true;
    // Try to dynamically import the native AdMob module. This avoids Metro trying
    // to resolve a native-only module when running inside Expo Go (which lacks it)
    // and prevents the "Value is undefined, expected an Object" runtime error.
    (async () => {
      try {
        const mod = await import('expo-ads-admob');
        if (mounted) {
          setAdModule(mod);
          // mark emulator as test device if available
          if (mod.setTestDeviceIDAsync) mod.setTestDeviceIDAsync('EMULATOR');
        }
      } catch (e) {
        console.log('expo-ads-admob not available in this runtime:', e.message || e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AdMob Banner demo</Text>
        <Text>Using test banner ad unit id.</Text>
        <StatusBar style="auto" />
      </View>

      <View style={styles.bannerContainer} pointerEvents="box-none">

      </View>
    </View>
  );
}

const BANNER_HEIGHT = Platform.OS === 'ios' || Platform.OS === 'android' ? 50 : 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: BANNER_HEIGHT,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: BANNER_HEIGHT,
    backgroundColor: 'transparent',
  },
});
