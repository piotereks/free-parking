# AdMob Banner Setup for React Native

## Current Status
✅ **Working!** The app now uses `expo-ads-admob` which works in Expo Go. Test banner ads are displaying using Google's demo ad unit ID.

## Current Implementation

The app currently uses **Google's test banner ad unit** which displays test ads in development:
- **Test Unit ID**: `ca-app-pub-3940256099942544/6300978111` (Fixed Size Banner)
- **Package**: `expo-ads-admob` (works with Expo Go)
- **Location**: Banner displays at the bottom of the app globally

## Steps to Add Working AdMob Ads

### Option 1: Use Expo Ads AdMob (Current - Recommended for Expo Go)
✅ **Already implemented!** 

To switch from test ads to your real AdMob account:

1. Create an AdMob account at https://apps.admob.com/
2. Create your app and get your App ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)
3. Create a Banner ad unit and get the Ad Unit ID
4. Update `mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-YOUR-APP-ID~ANDROID",
          "iosAppId": "ca-app-pub-YOUR-APP-ID~IOS"
        }
      ]
    ]
  }
}
```
5. Update `mobile/App.js` - replace the test unit ID with your real banner unit ID:
```javascript
const BANNER_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-YOUR-ID/IOS-BANNER',
  android: 'ca-app-pub-YOUR-ID/ANDROID-BANNER'
});
```
6. Run `npx expo prebuild` and rebuild your app

### Option 2: Advanced - React Native Google Mobile Ads
For more advanced features and better performance (requires custom dev client):

```bash
cd mobile

# 1. Uninstall expo-ads-admob
npm uninstall expo-ads-admob

# 2. Install react-native-google-mobile-ads
npm install react-native-google-mobile-ads

# 2. Update app.json with AdMob App ID
# Add to app.json under "expo":
# "plugins": [
#   [
#     "react-native-google-mobile-ads",
#     {
#       "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
#       "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
#     }
#   ]
# ]

# 3. Prebuild (generates native Android/iOS code)
npx expo prebuild

# 4. Build custom dev client
npm run android  # or npm run ios
```

### Option 2: Standalone Build (Production)
```bash
cd mobile

# Install and configure as above, then:
eas build --profile development --platform android
# or
eas build --profile production --platform android
```

## Update App.js to Show Real Ads

Replace the `SafeAdBanner` component in `mobile/App.js`:

```javascript
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

function SafeAdBanner() {
  return (
    <BannerAd
      unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-3940256099942544/6300978111'}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
```

## Resources
- [react-native-google-mobile-ads docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo custom dev client](https://docs.expo.dev/develop/development-builds/introduction/)
- [AdMob test IDs](https://developers.google.com/admob/android/test-ads)
