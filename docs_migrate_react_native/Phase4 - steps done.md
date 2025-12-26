# Free Parking Mobile App

React Native Expo app for real-time parking availability monitoring on iOS and Android.

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Expo CLI: `npm install -g expo-cli`
- **iOS Development**: Xcode (macOS only)
- **Android Development**: Android Studio + Android SDK

### Development

Start the Expo dev server:
```bash
npm run dev:mobile
```

This opens the Expo CLI menu where you can:
- **Press `i`** — Open in iOS Simulator (macOS only)
- **Press `a`** — Open in Android Emulator
- **Press `w`** — Open in web browser
- **Press `j`** — Open in Expo Go app (scan QR code on phone)

### Running on Device

1. **Install Expo Go** from App Store (iOS) or Play Store (Android)
2. Start dev server: `npm run dev:mobile`
3. Scan the QR code with your phone camera
4. Opens app in Expo Go immediately

**Note:** Expo Go has limitations (no camera, no background tasks). For production, use EAS Build or Prebuild.

## Building for Production

### iOS Build

**Step 1: Set up EAS (Expo Application Services)**
```bash
npm install -g eas-cli
eas login
```

**Step 2: Configure EAS project**
```bash
cd packages/mobile
eas build:configure
```

**Step 3: Build for iOS**
```bash
npm run build:mobile:ios
```

This builds a signed `.ipa` file ready for TestFlight or App Store distribution.

### Android Build

**Step 1: Same EAS setup as iOS**

**Step 2: Build for Android**
```bash
npm run build:mobile:android
```

This creates a signed `.apk` or `.aab` (Android App Bundle) ready for Play Store.

## Submission to App Stores

### iOS App Store

```bash
npm run submit:mobile:ios
```

Requires:
- Apple Developer Account ($99/year)
- Signing certificate
- Provisioning profile

### Google Play Store

```bash
npm run submit:mobile:android
```

Requires:
- Google Play Developer Account ($25 one-time)
- Signing key
- Play Store listing

## Project Structure

```
packages/mobile/
├── src/
│   ├── App.jsx                    # Root component with navigation
│   ├── adapters/
│   │   └── storageMobile.js       # AsyncStorage wrapper
│   ├── screens/
│   │   ├── DashboardScreen.jsx    # Real-time parking display
│   │   ├── StatisticsScreen.jsx   # Historical data & trends
│   │   └── SettingsScreen.jsx     # App settings & cache mgmt
│   ├── hooks/
│   │   └── useParkingDataAdapter.js # Custom hooks for data layer
│   └── utils/
│       └── storageUtils.js        # Location services, platform utilities
├── index.js                        # Expo entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies & scripts
└── babel.config.js                 # Babel transpilation config
```

## Shared Code

The mobile app reuses all business logic from `@free-parking/shared`:

- **Data Fetching**: Parking APIs, CSV parsing, caching (same as web)
- **Calculations**: Data age, approximations, capacity calculations
- **State Management**: Zustand store with realtime/history data
- **Utilities**: Date/time formatting, number formatting

The difference: Mobile uses **AsyncStorage** (React Native) instead of localStorage (web).

## Development Workflow

### 1. Modify shared code
```bash
# Edit packages/shared/src/
# Changes automatically hot-reload in mobile app
```

### 2. Modify mobile UI
```bash
# Edit packages/mobile/src/screens/
# Hot Module Reloading (HMR) refreshes the app
```

### 3. Test on iOS Simulator (macOS)
```bash
npm run dev:mobile:ios
```

### 4. Test on Android Emulator
```bash
npm run dev:mobile:android
```

### 5. Test on real device
```bash
npm run dev:mobile
# Scan QR code with Expo Go
```

## Debugging

### Console Logs
```javascript
console.log('Message'); // Appears in terminal during dev
```

### React Developer Tools
```bash
# Press Ctrl+M (Android) or Cmd+M (iOS simulator) → Debugger
```

### Network Inspection
- Open Expo CLI menu → select device → `o` (open debugger)
- Use browser DevTools to inspect network requests

## Environment Variables

Create `.env.local` in `packages/mobile/`:
```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_CORS_PROXY=https://corsproxy.io/?
```

Access in code:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

**Note:** Only `EXPO_PUBLIC_*` variables are exposed to the app. Others remain secret.

## Testing

Run tests:
```bash
npm run test:mobile
```

Run in watch mode:
```bash
npm -w packages/mobile run test:watch
```

Test files: `src/**/*.test.js`

## Linting

Check code quality:
```bash
npm -w packages/mobile run lint
```

## Common Issues

### Issue: "Cannot find module '@free-parking/shared'"
**Solution:** Ensure npm workspaces are installed:
```bash
npm install
```

### Issue: "Expo Go not available in your region"
**Solution:** Use Android Emulator or iOS Simulator instead, or use EAS Build.

### Issue: "Build fails on iOS"
**Solution:** Clear cache and rebuild:
```bash
cd packages/mobile
rm -rf node_modules .expo
npm install
npm run build:mobile:ios
```

### Issue: "Data not persisting between app restarts"
**Solution:** Check AsyncStorage permissions in `app.json` and ensure `storageMobile.js` is imported correctly.

## Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load heavy libraries** with dynamic imports
3. **Monitor bundle size**: `npm run build:mobile:android -- --analyze`
4. **Use FlatList** for long lists (not ScrollView + many items)
5. **Memoize expensive calculations** with `useMemo`

## Future Enhancements

- [ ] **Push Notifications**: Alert users when parking gets full
- [ ] **Geolocation**: Show distance to parking spots
- [ ] **Maps Integration**: Display parking locations on map
- [ ] **Dark Mode**: Theme toggle with persistent preference
- [ ] **Offline Support**: Serve cached data when offline
- [ ] **Background Sync**: Sync data when user returns online
- [ ] **Widget**: Home screen widget showing live parking status

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **EAS Build Docs**: https://docs.expo.dev/eas-build/introduction/
- **React Navigation**: https://reactnavigation.org

## Support

For issues or questions:
1. Check Expo docs: https://docs.expo.dev
2. Search GitHub issues: https://github.com/expo/expo/issues
3. Ask community: https://forums.expo.dev

## License

Same as root project.
- Use React Native components (`FlatList`, `View`, `Text`, `ActivityIndicator`) instead of web components
- Fetch real-time data on mount and every 5 minutes (same logic as web)
- Display parking cards with free spaces, age label, and status

---

## **Step 6: Create `packages/mobile/src/screens/StatisticsScreen.jsx`**
**What**: Mobile version of Statistics (historical data chart)
**Why**: Reuse shared history parsing and caching logic
**Will**:
- Import `useParkingStore`, `calculateDataAge` from shared
- Use a React Native charting library (e.g., `react-native-svg` + custom chart) instead of ECharts
- Display historical parking data in a simple line/bar chart format
- Support date range filtering if needed

---

## **Step 7: Create `packages/mobile/src/screens/SettingsScreen.jsx`**
**What**: Settings UI for mobile-specific features
**Why**: User can clear cache, toggle dark mode, check last sync time
**Will**:
- Import `clearCache()` from shared
- Buttons: "Clear Cache", "Force Refresh"
- Display: Last update time, data age
- Settings: Dark mode toggle (can reuse theme logic from web if needed)

---

## **Step 8: Create `packages/mobile/src/utils/storageUtils.js`**
**What**: Mobile-specific utility functions (e.g., geolocation, permissions)
**Why**: Some logic is mobile-only (location services, push notifications)
**Will**:
- Request location permissions
- Handle Android/iOS permission differences
- Geolocation fetching if needed for future features

---

## **Step 9: Create index.js**
**What**: Entry point that Expo runs first
**Why**: Registers the root App component with React Native
**Will**:
- Import and register App from `src/App.jsx`
- One line: `import './src/App'` or use Expo's typical entry pattern

---

## **Step 10: Create `packages/mobile/app.json` navigation metadata**
**What**: Define screen names, icons, labels for bottom tabs
**Why**: Navigation library needs to know which screens exist and how to display them
**Will**:
- Tabs: "Dashboard", "Statistics", "Settings"
- Icons for each tab (home, chart, cog)
- Screen options (title, icon color, badge counts if tracking)

---

## **Step 11: Update root package.json proxy scripts**
**What**: Add `dev:mobile`, `build:mobile:ios`, `build:mobile:android` scripts
**Why**: Consistency—users can run `npm run dev:mobile` instead of remembering Expo commands
**Will** include:
- `"dev:mobile": "expo start"` or `"expo start --clear"`
- `"build:mobile:ios": "eas build --platform ios"`
- `"build:mobile:android": "eas build --platform android"`
- `"test:mobile": "npm -w packages/mobile run test"` (if adding tests)

---

## **Step 12: Create `packages/mobile/src/hooks/useParkingDataAdapter.js`**
**What**: Custom hook that injects the mobile storage adapter into the data layer
**Why**: Web and mobile both use shared data layer, but with different storage backends
**Will**:
- Accept `storageMobile` adapter
- Wrap `useParkingStore` calls so they use AsyncStorage
- Example: Initialize store with `setStorageAdapter(storageMobile)` on first load

---

## **Step 13: Add .gitignore and basic config files**
**What**: .gitignore, `.prettierrc`, `babel.config.js`
**Why**: Standard React Native/Expo project setup
**Will**:
- Ignore: node_modules, `.expo/`, build outputs, `.env`
- Babel config for Expo/React Native transpilation

---

## **Step 14: Create README.md**
**What**: Mobile-specific development guide
**Why**: Documents how to run iOS/Android builds, EAS Build setup, simulator instructions
**Will include**:
- `npm run dev:mobile` to start Expo dev server
- `npm run build:mobile:ios` to build for Apple
- `npm run build:mobile:android` to build for Android
- Prerequisites: Xcode, Android Studio, Expo CLI
- Testing: `npm run test:mobile`

---

## **Summary of What Phase 4 Achieves**

By the end:
- ✅ Mobile app structure mirrors web app (screens in place)
- ✅ Mobile uses **same storage adapter pattern** (AsyncStorage instead of localStorage)
- ✅ Mobile **reuses all shared logic** (parkingStore, dateUtils, parsers, config)
- ✅ Mobile can fetch parking APIs and cache data identically to web
- ✅ Developers can run `npm run dev:mobile` to start Expo dev server
- ✅ Mobile app is ready for Phase 5 (UI polish and React Native-specific features like push notifications, geolocation)

**Key insight**: The mobile app isn't a copy of the web app—it's a **different UI** (React Native components) with the **same business logic** (shared package). This is why Phase 3 (storage adapters) was crucial.