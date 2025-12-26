# Phase 4 Walkthrough: Initialize Expo Mobile App Scaffold

Here's the step-by-step plan for setting up the Expo mobile app:

## **Step 1: Create package.json**
**What**: Define the mobile app's metadata and dependencies
**Why**: Npm needs to know this is a valid workspace package with its own dependencies
**Will include**:
- Name: `@free-parking/mobile`
- Scripts: `dev` (Expo start), `build:ios`, `build:android`, `eject`
- Dependencies: `expo`, `react-native`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `axios`, `zustand`, `@free-parking/shared`

---

## **Step 2: Create `packages/mobile/app.json`**
**What**: Expo configuration file for iOS/Android builds
**Why**: Tells Expo how to build and run your app (app name, version, splash screen, icon, etc.)
**Will include**:
- App name, slug, version
- iOS/Android build settings
- Plugins for AsyncStorage, navigation, permissions

---

## **Step 3: Create `packages/mobile/src/adapters/storageMobile.js`**
**What**: React Native storage adapter implementing the same interface as `storageWeb.js`
**Why**: Web uses `localStorage` (sync), mobile uses `AsyncStorage` (async). Both need the same interface (`getItem`, `setItem`, `removeItem`)
**Will**:
- Import `AsyncStorage` from React Native
- Wrap its methods to match the storage interface from storage.js
- Example: `AsyncStorage.getItem()` already returns a Promise, so it's a direct pass-through

---

## **Step 4: Create `packages/mobile/src/App.jsx`**
**What**: Root component that sets up navigation and passes storage adapter to data layer
**Why**: Entry point for the app; wires up the storage adapter so the shared data layer uses AsyncStorage instead of localStorage
**Will**:
- Import `NavigationContainer` from React Navigation
- Set up bottom-tab navigation (Dashboard, Statistics, Settings tabs)
- Provide the mobile storage adapter context or pass it down

---

## **Step 5: Create `packages/mobile/src/screens/DashboardScreen.jsx`**
**What**: Mobile version of Dashboard that reuses shared logic from `@free-parking/shared`
**Why**: Parking data fetching, caching, and calculations are identical on mobile. Only the UI differs.
**Will**:
- Import `useParkingStore` from shared
- Import shared `calculateDataAge`, `formatAgeLabel`, `applyApproximations`
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

