# Parking Availability App - Phase 2 Detailed Plan

## Plan: Detailed Phase 2 MVP Mobile App (Expo/React Native)

**TL;DR**: Six granular iterations building Expo app from scratch, integrating shared package (file:../shared), implementing mobile adapters (AsyncStorage, direct fetch), building Dashboard and Statistics screens with React Native charting (victory-native), establishing CI/CD for Expo builds, and shipping v0.1.0-beta.0. Each iteration includes specific functions, components, unit/integration tests, emulator validation, lint, and documentation updates.

### Iterations (6 total, 2-3 days each estimated)

#### **Iteration 1: Scaffold Expo Project & Shared Integration**

**Objectives:** Bootstrap default Expo project, install base deps, verify Metro bundler works with shared package (file:../shared), validate offline build.

**Tasks:**

1. ✅ **Project scaffold** — `npx create-expo-app parking-mobile`, move to `mobile/` folder, run `npm install` — **COMPLETED 2025-12-31**
   - Added offline mode: `--offline` flag to all npm scripts (start, android, ios, web)
   - Added `prebuild` script: `expo prebuild` for native project generation
   - Added Android build scripts: `android:build` (gradlew assembleDebug), `android:install` (adb install), `android:deploy` (gradlew installDebug)
   - Configured Android SDK via `local.properties`
   - Verified: APK builds successfully, installs on emulator, Gradle deprecation warnings are expected and safe
2. ✅ **Configure Metro bundler** — Add `metro.config.js`: resolve alias for `parking-shared`, enable ESM in bundle, test `require` fallback — **COMPLETED 2026-01-01**
3. ✅ **Install core dependencies**: — **COMPLETED 2026-01-01**
   - Zustand 5.x (shared peerDep)
   - React Native defaults (already in Expo)
   - PapaParse 5.x (CSV parsing, works in RN)
   - AsyncStorage 1.x (async storage)
   - React Native Vector Icons (icons; Expo-compatible)
   - Vitest + React Native Testing Library (test runner)
4. ✅ **Verify shared import** — **COMPLETED 2026-01-01**
   — Create test file: `src/testShared.js` importing `parkingUtils`, `dateUtils`, `createParkingStore` from `parking-shared`; run `npm test`
5. ✅ **Create app skeleton** — mobile/src/App.js: minimal component tree with `View` + `Text` — **COMPLETED 2026-01-01**
6. ✅ **Set up vitest config** — Copy pattern from shared, configure for RN environment (preset: `react-native`) — **COMPLETED 2026-01-01**
7. ✅ **Initial tests** — `test/shared.test.js`: verify exports load, store factory initializes — **COMPLETED 2026-01-01**
8. ✅ **Lint setup** — ESLint config from shared + RN-specific rules (no DOM refs) — **COMPLETED 2026-01-01**
9. ✅ **Build validation** — `npm run build` (Expo prebuild), confirm no errors — **COMPLETED 2026-01-01**

**Validation Steps:**

- [x] `npm test` passes (testShared.test.js)
- [x] `npm run lint` passes (0 errors)
- [x] `cd android && .\\gradlew.bat assembleDebug` succeeds (fully local APK build)
- [x] Expo Prebuild generates native files without warnings
- [ ] SKIPPED: All shared exports resolving in Metro debugger —  (deferred; unit tests validate imports)

**Checklist:**

- [x] metro.config.js with alias for shared + ESM fallback
- [x] package.json with shared: file:../shared
- [x] vitest.config.js (react-native preset)
- [x] eslint.config.js (RN rules, no DOM)
- [x] src/App.js (minimal tree)
- [x] src/testShared.js (import + basic test)
- [x] test/shared.test.js (store factory test)
- [x] docs: Update MIGRATION_PLAN.md Iteration Log

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Phase 2, Step 1 ✅)
- Create mobile/README.md with setup instructions

---

#### **Iteration 2: Mobile Adapters & Store Integration** — ✅ Mostly completed (adapters & tests done; cache-key verification and docs pending)

**Objectives:** Implement AsyncStorage and fetch adapters, inject into shared store, test store initialization offline, validate cache shapes match web.

**Tasks:**

1. ✅ **Create mobile adapters folder** — `mobile/src/adapters/` — **COMPLETED 2026-01-01**
2. ✅ **mobileStorageAdapter.js**:

   - Export `createMobileStorageAdapter()` factory
   - Implement: `get(key)`, `set(key, value)`, `remove(key)`, `clear()`
   - All methods async (AsyncStorage-native)
   - Wrap JSON parse/stringify
   - Log errors (non-blocking)
   - **Example:**

     ```javascript
     import AsyncStorage from "@react-native-async-storage/async-storage";

     export const createMobileStorageAdapter = () => ({
       get: async (key) => {
         try {
           const val = await AsyncStorage.getItem(key);
           return val ? JSON.parse(val) : null;
         } catch (e) {
           console.error("Storage get failed:", e);
           return null;
         }
       },
       set: async (key, value) => {
         try {
           await AsyncStorage.setItem(key, JSON.stringify(value));
         } catch (e) {
           console.error("Storage set failed:", e);
         }
       },
       remove: async (key) => {
         try {
           await AsyncStorage.removeItem(key);
         } catch (e) {
           console.error("Storage remove failed:", e);
         }
       },
       clear: async () => {
         try {
           await AsyncStorage.clear();
         } catch (e) {
           console.error("Storage clear failed:", e);
         }
       },
     });
     ```

3. ✅ **mobileFetchAdapter.js**:
   - Export `createMobileFetchAdapter()` factory
   - Implement: `fetch(url, options)`, `fetchJSON(url, options)`, `fetchText(url, options)`
   - NO CORS proxy (mobile native, no browser restrictions)
   - Add cache-busting `?t={Date.now()}` (optional, match web behavior)
   - Handle network errors gracefully
   - **Example:**
     ```javascript
     export const createMobileFetchAdapter = () => ({
       fetch: async (url, options = {}) => {
         try {
           const finalUrl =
             url + (url.includes("?") ? "&" : "?") + `t=${Date.now()}`;
           return await fetch(finalUrl, options);
         } catch (e) {
           console.error("Fetch failed:", e);
           throw e;
         }
       },
       fetchJSON: async (url, options) => {
         const res = await this.fetch(url, options);
         return res.json();
       },
       fetchText: async (url, options) => {
         const res = await this.fetch(url, options);
         return res.text();
       },
     });
     ```
4. ✅ **Create useStore hook** — `mobile/src/hooks/useParkingStore.js`:

   - Call shared's `createParkingStore()` with mobile adapters
   - Export `useStoreName` (Zustand hook)
   - Initialize once per app (singleton pattern)
   - **Example:**

     ```javascript
     import { createParkingStore } from "parking-shared";
     import { createMobileStorageAdapter } from "../adapters/mobileStorageAdapter";
     import { createMobileFetchAdapter } from "../adapters/mobileFetchAdapter";

     const adapters = {
       storage: createMobileStorageAdapter(),
       fetch: createMobileFetchAdapter(),
       logger: console,
     };

     export const useParkingStore = createParkingStore(adapters);
     ```

5. ✅ **Unit tests for adapters** — `test/adapters.test.js`:
   - Test AsyncStorage get/set/remove/clear (mock AsyncStorage)
   - Test fetch adapter (mock fetch, verify cache-busting param)
   - Verify error handling (non-blocking)
   - Test store initialization with adapters
6. ✅ **Store initialization test** — `test/store.test.js`:
   - Verify store state shape matches web version (realtimeData, historyData, etc.)
   - Test that clearCache() calls storage.clear()
   - Test resetStore() returns to initial state
7. ✅ **Offline mode test** — `test/offline.test.js`:
   - Mock AsyncStorage with cached data
   - Load app, verify store hydrates from cache
   - No network calls attempted

-**Validation Steps:**

- [x] `npm test` passes (adapters.test.js, store.test.js, offline.test.js)
- [x] `npm run lint` passes
- [x] `cd android && .\\gradlew.bat assembleDebug` succeeds (fully local APK build)
- [x] AsyncStorage mock data loads into store on app start
- [x] Store state shape verified against web version

**Checklist:**

- [x] mobile/src/adapters/mobileStorageAdapter.js (async, error-safe)
- [x] mobile/src/adapters/mobileFetchAdapter.js (no CORS proxy)
- [x] mobile/src/hooks/useParkingStore.js (factory init)
- [x] test/adapters.test.js (storage + fetch tests)
- [x] test/store.test.js (store shape + actions)
- [x] test/offline.test.js (cache hydration)
- [x] Verify cache keys match web: `parking_realtime_cache`, `parking_history_cache`
- [x] docs: Update copilot_instructions.md (adapter patterns)

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Iteration 2 ✅)
- Update mobile/README.md with adapter architecture

---

#### **Iteration 3: Dashboard Screen MVP**

**Objectives:** Build real-time Dashboard screen, display live parking data, implement theme toggle (Appearance API), offline cache display, live data age clock.

**Tasks:**

1. ✅ **Create screens folder** — `mobile/src/screens/` — **COMPLETED 2026-01-04**
2. ✅ **DashboardScreen.js** — `mobile/src/screens/DashboardScreen.js` — **COMPLETED 2026-01-04**:
   - Consume `useParkingStore` hook: realtimeData, realtimeLoading, realtimeError
   - Use React Native Native Appearance API for theme detection
   - Render FlatList of parking locations
   - Display: ParkingGroupName, CurrentFreeGroupCounterValue, Timestamp, ageMinutes
   - Show LoadingSkeleton while realtimeLoading === true
   - Show error message if realtimeError
   - Render "No data" if empty array
   - Live clock: Update every 1 second to show data age (e.g., "5 min ago")
   - **Component Tree:**
     ```
     DashboardScreen
     ├── Header (parking icon, theme toggle)
     ├── AgeStatus (aggregated status bar)
     └── FlatList
         └── ParkingCard x N
             ├── Name
             ├── FreeSpaces / Capacity
             ├── Timestamp + Age
             └── Approximation badge (if applicable)
     ```
3. ✅ **ParkingCard.js sub-component** — `mobile/src/components/ParkingCard.js` — **COMPLETED 2026-01-04**:
   - Props: `data` (parking object), `now` (Date), `allOffline` (bool)
   - Display age-based color: red (≥15 min), yellow (5-15 min), green (<5 min)
   - Show approximation indicator if present
   - Tap to copy to clipboard (optional)
4. ✅ **LoadingSkeletonCard.js** — `mobile/src/components/LoadingSkeletonCard.js` — **COMPLETED 2026-01-04**:
   - Placeholder while loading
   - 3-4 rows of gray boxes
5. **Data flow**:
   - ✅ On mount, trigger `refreshCallback` (will be set by DataManager in later iteration) — **COMPLETED 2026-01-04**
   - ✅ Subscribe to store via `useParkingStore()` (Zustand hook) — **COMPLETED 2026-01-04**
   - ✅ Update `now` state every 1 second for live age display — **COMPLETED 2026-01-04**
   - ✅ Apply `applyApproximations()` from shared (before rendering) — `mobile/src/App.js` — **COMPLETED 2026-01-04**
6. ✅ **Theme integration** — `mobile/src/context/ThemeContext.js` (Appearance API + persisted preference) — **COMPLETED 2026-01-04**
   - Read `Appearance.getColorScheme()` on mount
   - Store in context or state
   - Apply colors: light mode (white bg, black text), dark mode (dark bg, light text)
7. ❗ **Unit tests** — `test/screens/DashboardScreen.test.js` — **PENDING 2026-01-04**:
   - Mock store with sample parking data
   - Verify FlatList renders cards
   - Verify age updates every second
   - Test error state rendering
   - Test loading state rendering
   - Test empty state

**Validation Steps:**

- [ ] `npm test` passes (DashboardScreen.test.js) — **PENDING 2026-01-04**
- [x] `npm run lint` passes — **COMPLETED 2026-01-04**
- [ ] Offline Emulator run: App loads, displays cached parking data if available — **PENDING 2026-01-04**
- [x] Live age counter increments every 1 second
- [x] Theme colors match light/dark modes
- [ ] No network calls on mount (cache-first) — **PENDING 2026-01-04**

**Checklist:**

- [x] mobile/src/screens/DashboardScreen.js (FlatList + live clock)
- [x] mobile/src/components/ParkingCard.js (card UI)
- [x] mobile/src/components/LoadingSkeletonCard.js (skeleton)
- [x] mobile/src/context/ThemeContext.js (Appearance API + storage)
- [ ] test/screens/DashboardScreen.test.js (rendering + age update)
- [x] Integrate applyApproximations() from shared on render — `mobile/src/App.js` — **COMPLETED 2026-01-04**
- [ ] docs: copilot_instructions.md (component structure)
 - [x] mobile/src/screens/DashboardScreen.js (FlatList + live clock)
 - [x] mobile/src/components/ParkingCard.js (card UI)
 - [x] mobile/src/components/LoadingSkeletonCard.js (skeleton)
 - [x] mobile/src/context/ThemeContext.js (Appearance API + storage)
 - [ ] test/screens/DashboardScreen.test.js (rendering + age update) — **PENDING 2026-01-04**
 - [x] Integrate applyApproximations() from shared on render — `mobile/src/App.js` — **COMPLETED 2026-01-04**


**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Iteration 3 ✅)

---

#### **Iteration 4: Statistics Screen with Charts**

**Objectives:** Build Historical Statistics screen, integrate React Native charting (victory-native), display dual parking trends with projections, implement zoom.

**Tasks:**

1. **Add chart library** — Install `victory-native` (RN-compatible charting via SVG)
   - Also install `react-native-svg` (dependency for victory-native)
2. **StatisticsScreen.js**:
   - Consume `useParkingStore`: historyData, historyLoading, lastHistoryUpdate
   - Parse historyData using shared's `dataTransforms.js` functions
   - Render two charts (or single stacked chart):
     - GreenDay free spaces over time
     - Uni Wroc free spaces over time
   - Add capacity reference lines (187 for GD, 41 for Uni)
   - Include dashed "projected" lines extending to recent max timestamp
   - Zoom state: persist zoom level when switching views
   - Show color palette selector (neon, classic, cyberpunk)
3. **Chart data processing**:
   - Extract GreenDay times/values from historyData (gd_time, greenday free columns)
   - Extract Uni times/values (uni_time, uni free columns)
   - Parse timestamps with `parseTimestamp()` from shared
   - Handle missing/sparse data (don't interpolate, just skip)
   - Calculate projections (extend last value to global max timestamp)
4. **VictoryNativeChart.js sub-component**:
   - Props: `data` (array), `title` (string), `capacity` (number), `color` (string)
   - Render `VictoryChart` + `VictoryLine` + `VictoryAxis` + `VictoryVoronoiContainer`
   - Touch tooltip on hover
5. **ColorPalette selector**:
   - Neon: bright colors (magenta, cyan)
   - Classic: standard (blue, orange)
   - Cyberpunk: dark neon
   - Modern: pastel
   - Store selection in AsyncStorage under `parking_chart_palette`
6. **Unit tests** — `test/screens/StatisticsScreen.test.js`:
   - Mock store with CSV history data
   - Verify chart renders with correct data series
   - Test color palette persistence
   - Test projection line calculation
   - Test missing data handling (sparse timestamps)

**Validation Steps:**

- [ ] `npm test` passes (StatisticsScreen.test.js)
- [ ] `npm run lint` passes
- [ ] Emulator run: Statistics screen shows two charts with dual parking trends
- [ ] Zoom gesture works (pinch or scroll to zoom in/out)
- [ ] Palette changes update colors instantly
- [ ] Data projection lines visible and correct
- [ ] Capacity reference lines render at correct positions

**Checklist:**

- [ ] Install victory-native + react-native-svg
- [ ] mobile/src/screens/StatisticsScreen.js (chart layout)
- [ ] mobile/src/components/VictoryNativeChart.js (chart component)
- [ ] mobile/src/hooks/useChartPalette.js (palette state)
- [ ] test/screens/StatisticsScreen.test.js (chart rendering)
- [ ] Share data processing logic with web (consider extracting to shared later)
- [ ] docs: Document chart library choice (victory-native) in copilot_instructions.md

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Iteration 4 ✅)

---

#### **Iteration 5: Ad Banner (AdMob) Integration**

**Objectives:** Add ad monetization via AdMob: create AdMob account/setup, integrate AdMob SDK into app, add ad banner on Dashboard, and validate ad rendering in emulator/dev builds.

**Tasks:**

1. **AdMob account & app configuration**:
   - Create AdMob account and register app(s) (Android package name)
   - Create/adopt Ad Unit IDs for banner (use test IDs in development)
   - Document AdMob account steps and required assets (privacy, consent)
2. **Integrate AdMob SDK**:
   - Add `expo-ads-admob` (Expo-managed) or `@react-native-firebase/admob` depending on prebuild choice
   - Follow setup for Android (update `AndroidManifest.xml` if prebuilding)
   - Add runtime consent flow if required (GDPR/CCPA) or mark for Phase 3 detailed consent flow
3. **Banner component**:
   - Implement `mobile/src/components/AdBanner.js` which shows a test banner in development and real ad in production
   - Provide props for `unitId`, `size` and `style`
4. **Dashboard placement**:
   - Place `AdBanner` component at bottom of `DashboardScreen` (non-intrusive)
   - Ensure banner does not obstruct pull-to-refresh or important controls
5. **Local testing & validation**:
   - Use AdMob test IDs during development
   - Verify banner renders on Android emulator and that app does not crash
   - Test different screen sizes/resolutions
6. **E2E smoke test**:
   - Verify banner loads under slow network
   - Confirm no impact on Dashboard performance
7. **Documentation & privacy**:
   - Add `mobile/docs/ads.md` with AdMob setup, test flags, and privacy notes

**Validation Steps:**

- [ ] AdMob account & app recorded in project docs
- [ ] `AdBanner` loads with test IDs in dev
- [ ] No crashes on banner render (Android emulator)
- [ ] Banner placement passes UX check (no overlap)

**Checklist:**

- [ ] Add `expo-ads-admob` or chosen SDK
- [ ] Create `mobile/src/components/AdBanner.js`
- [ ] Update `DashboardScreen` to include banner (bottom)
- [ ] Add `mobile/docs/ads.md` with account setup and test instructions

---

#### **Iteration 6: Android Deployment (Gradle Build Check + Release)**

**Objectives:** Validate full Gradle build and deploy Android APK; ensure release artifacts are reproducible and documented.

**Tasks:**

1. **Full Gradle build validation**:
   - Run `cd android && ./gradlew clean && ./gradlew assembleRelease` locally (or via CI runner)
   - Fix any native build issues introduced by AdMob SDK or other native modules
   - Verify ProGuard/R8 rules if minification enabled
2. **Signing & release configuration**:
   - Configure `keystore.properties` and signing configs (document how to create keystore)
   - Ensure `android/app/build.gradle` references signing configs for release
3. **Build artifact generation**:
   - Generate signed `app-release.apk` and verify installation on device/emulator
   - Archive APK in `build/` and document path
4. **Smoke validation**:
   - Install APK on emulator and run through main flows (Dashboard, Statistics)
   - Confirm AdBanner renders in release build using test ad unit or test devices
5. **CI step (optional)**:
   - Add job to GitHub Actions to run Gradle assembleRelease in a self-hosted runner or build matrix that supports Android SDK
6. **Release notes & tagging**:
   - Draft release notes for the APK and tag the release if ready

**Validation Steps:**

- [ ] `./gradlew assembleRelease` completes without errors
- [ ] Signed APK installs on emulator/device
- [ ] Core flows run without crash in release APK
- [ ] Ad banner functions in release build (test IDs or test devices)

**Checklist:**

- [ ] Signing keystore created and documented
- [ ] Release build documented in `mobile/docs/release.md`
- [ ] CI job added to run Gradle build (if runner available)
- [ ] APK artifacts archived

---

> Note: Remaining development iterations (previously Iteration 5 and Iteration 6 in this file) have been moved to `PHASE3_PLAN_DETAILED.md` for Phase 3 planning and longer-term follow-up.

---
