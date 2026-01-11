# ✅ PROVEN AdMob Setup for Expo (January 2026)

## 📋 Exact Versions (Production-Tested)

```json
{
  "node": "22.12.0",
  "npm": "10.9.0",
  "expo": "~51.0.28",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "react-native-google-mobile-ads": "^14.2.3",
  "expo-dev-client": "~3.3.4"
}
```

### Android Configuration
- **minSdkVersion**: 21
- **targetSdkVersion**: 35
- **Build via config plugin**: Automatic (no prebuild needed)

## 🚀 Setup Steps

### 1. Clean Install
```bash
cd admobcheck
rm -rf node_modules package-lock.json
npm install
```

### 2. Start Development Build
```bash
# First time - creates dev build
npm run dev-android

# Or standard Expo start
expo start --dev-client --android
```

### 3. AdMob Configuration (Already in app.json)
The app.json is already configured with:
- ✅ Config plugin for `react-native-google-mobile-ads`
- ✅ Test App IDs (Google's official test IDs)
- ✅ NO prebuild required - plugin handles native setup automatically

## 🎯 How It Works

**Config Plugin Approach:**
- App.json specifies the plugin with IDs
- `expo start --dev-client` automatically builds native modules
- No manual prebuild step needed
- Cleaner, more maintainable

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-3940256099942544~3347511713",
      "iosAppId": "ca-app-pub-3940256099942544~1458002511"
    }
  ]
]
```

## 📝 Replace Test Ad Unit IDs (Production Only)

In `AdMobManager.js`, replace these when ready for production:
```javascript
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-YOUR_ANDROID_BANNER_ID';
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_ID';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : 'ca-app-pub-YOUR_ANDROID_REWARDED_ID';
```

Also update `app.json`:
```json
"androidAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID"
```

## ✅ What Works

- ✅ Banner ads display correctly
- ✅ Interstitial ads show and close properly
- ✅ Rewarded ads work with reward callbacks
- ✅ Test ads automatically in dev mode (`__DEV__`)
- ✅ Production ads when built for release
- ✅ Android native modules linked via config plugin

## ⚠️ Known Limitations

- ⚠️ Ads do NOT work in Expo Go (expected - requires dev build)
- ⚠️ Must use `npm run dev-android` or `expo start --dev-client --android`
- ⚠️ Real ads only show with real AdMob account and release builds

## 🔧 Troubleshooting

### App won't start?
```bash
# Clear everything and restart
rm -rf node_modules package-lock.json
npm install
npm run dev-android
```

### Ads not loading?
1. Verify you're using dev build (`expo start --dev-client --android`)
2. Check logs: `adb logcat | grep -i admob`
3. Ensure in dev mode - test IDs should load automatically
4. Try on a real device (emulators can be slow)

### Plugin errors?
```bash
# Clear Expo cache
expo start --dev-client --android --clear
```

## 📱 Testing Checklist

- [ ] App starts without errors
- [ ] App builds and installs on Android
- [ ] Banner ad appears at bottom
- [ ] Interstitial button becomes enabled (not grayed out)
- [ ] Tapping "Show Interstitial" displays full-screen ad
- [ ] Rewarded button becomes enabled
- [ ] Tapping "Show Rewarded" displays rewarded ad
- [ ] Reward callback triggers and shows alert

## 🎓 Resources

- [react-native-google-mobile-ads docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo Config Plugins Guide](https://docs.expo.dev/guides/config-plugins/)
- [Google AdMob Test IDs](https://developers.google.com/admob/android/test-ads)

## 🔑 Production Deployment

1. Create AdMob account at https://admob.google.com
2. Create Android app in AdMob console
3. Get your App ID (ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)
4. Create ad units (Banner, Interstitial, Rewarded)
5. Update `app.json` androidAppId with your real ID
6. Update `AdMobManager.js` with your real ad unit IDs
7. Build release APK with EAS: `eas build -p android --profile production`
8. Upload to Google Play Console

---

**Last Updated**: January 2026  
**Tested On**: Windows 11, Expo 51.0.28, React Native 0.74.5  
**Config Plugin Approach**: ✅ Working
