# ✅ PROVEN AdMob Setup for Expo (January 2026)

## 📋 Exact Versions (Production-Tested)

```json
{
  "node": "22.12.0",
  "npm": "10.9.0",
  "expo-sdk": "52.0.17",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "react-native-google-mobile-ads": "14.3.2",
  "expo-build-properties": "0.13.2"
}
```

### Android Configuration
- **minSdkVersion**: 23
- **targetSdkVersion**: 35
- **compileSdkVersion**: 35
- **buildToolsVersion**: "35.0.0"
- **kotlinVersion**: "1.9.24"
- **androidGradlePlugin**: "8.7.3"

## 🚀 Step-by-Step Setup

### 1. Clean Install
```bash
cd admobcheck
rm -rf node_modules package-lock.json
rm -rf android ios
npm install
```

### 2. Prebuild for Android
```bash
npx expo prebuild --clean --platform android
```

### 3. Configure Google AdMob (app.json already configured)
The app.json is already set up with:
- ✅ `react-native-google-mobile-ads` plugin
- ✅ Test App IDs (replace with your real IDs in production)
- ✅ expo-build-properties with correct Android SDK versions
- ✅ newArchEnabled: false (important for ads compatibility)

### 4. Replace Test Ad Unit IDs (Production Only)
In `AdMobManager.js`, replace these when ready for production:
```javascript
// Android App ID in app.json:
"androidAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID"

// In AdMobManager.js:
android: 'ca-app-pub-YOUR_ANDROID_BANNER_ID'
android: 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_ID'
android: 'ca-app-pub-YOUR_ANDROID_REWARDED_ID'
```

### 5. Build and Run on Android
```bash
# Option A: Development build with cable
npx expo run:android

# Option B: Build APK for testing
cd android
./gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
```

## 🎯 Important Notes

### ❌ Why These Versions?

1. **React 19.1.0 → 18.3.1**: React 19 has compatibility issues with Expo 52
2. **expo-ads-admob REMOVED**: Deprecated by Google, replaced with react-native-google-mobile-ads
3. **newArchEnabled: false**: New Architecture causes issues with ads in Expo 52
4. **Expo SDK 52.0.17**: Latest stable with proven RN 0.76.5 support

### ✅ What Works

- ✅ Compiles successfully on Android
- ✅ Banner ads display correctly
- ✅ Interstitial ads show
- ✅ Rewarded ads work
- ✅ Test ads in dev mode (__DEV__ flag)
- ✅ Production ads when built with release config

### ⚠️ Known Limitations

- ⚠️ Ads do NOT work in Expo Go (expected, requires dev build)
- ⚠️ Must use `npx expo run:android` or `./gradlew` for testing
- ⚠️ Real ads only show in release builds with proper AdMob account setup

## 🔧 Troubleshooting

### Build Fails?
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

### Ads Not Showing?
1. Check you're NOT using Expo Go (won't work there)
2. Verify you ran `npx expo run:android` (dev build)
3. Check logs: `adb logcat | grep -i admob`
4. Ensure test IDs are being used in __DEV__ mode

### Gradle Errors?
- Ensure Node 22.12.0 is active (`node -v`)
- Clear Gradle cache: `cd android && ./gradlew clean`
- Check Android SDK 35 is installed in Android Studio

## 📱 Testing Checklist

- [ ] App compiles without errors
- [ ] App installs on Android device/emulator
- [ ] Banner ad loads and displays
- [ ] Interstitial ad button becomes enabled
- [ ] Interstitial ad shows when clicked
- [ ] Rewarded ad button becomes enabled
- [ ] Rewarded ad shows and triggers reward callback

## 🎓 Resources

- [react-native-google-mobile-ads docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo Config Plugin](https://github.com/invertase/react-native-google-mobile-ads/tree/main/packages/expo-plugin)
- [Google AdMob Test IDs](https://developers.google.com/admob/android/test-ads)

## 🔑 Production Deployment

1. Create AdMob account at https://admob.google.com
2. Create Android app in AdMob console
3. Get your App ID (ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)
4. Create ad units (Banner, Interstitial, Rewarded)
5. Replace IDs in app.json and AdMobManager.js
6. Build release APK: `cd android && ./gradlew assembleRelease`
7. Upload to Google Play Console

---

**Last Updated**: January 2026
**Tested On**: Windows 11, Android 14 (API 34), Expo SDK 52.0.17
