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
6. **Set up vitest config** — Copy pattern from shared, configure for RN environment (preset: `react-native`)
7. **Initial tests** — `test/shared.test.js`: verify exports load, store factory initializes
8. **Lint setup** — ESLint config from shared + RN-specific rules (no DOM refs)
9. **Build validation** — `npm run build` (Expo prebuild), confirm no errors

**Validation Steps:**

- [ ] `npm test` passes (testShared.test.js)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npx eas build --platform android --local` succeeds (offline, no EAS account)
- [ ] Expo Prebuild generates native files without warnings
- [ ] All shared exports resolving in Metro debugger

**Checklist:**

- [ ] metro.config.js with alias for shared + ESM fallback
- [ ] package.json with shared: file:../shared
- [ ] vitest.config.js (react-native preset)
- [ ] eslint.config.js (RN rules, no DOM)
- [ ] src/App.js (minimal tree)
- [ ] src/testShared.js (import + basic test)
- [ ] test/shared.test.js (store factory test)
- [ ] docs: Update MIGRATION_PLAN.md Iteration Log

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Phase 2, Step 1 ✅)
- Create mobile/README.md with setup instructions

---

#### **Iteration 2: Mobile Adapters & Store Integration**

**Objectives:** Implement AsyncStorage and fetch adapters, inject into shared store, test store initialization offline, validate cache shapes match web.

**Tasks:**

1. **Create mobile adapters folder** — `mobile/src/adapters/`
2. **mobileStorageAdapter.js**:

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

3. **mobileFetchAdapter.js**:
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
4. **Create useStore hook** — `mobile/src/hooks/useParkingStore.js`:

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

5. **Unit tests for adapters** — `test/adapters.test.js`:
   - Test AsyncStorage get/set/remove/clear (mock AsyncStorage)
   - Test fetch adapter (mock fetch, verify cache-busting param)
   - Verify error handling (non-blocking)
   - Test store initialization with adapters
6. **Store initialization test** — `test/store.test.js`:
   - Verify store state shape matches web version (realtimeData, historyData, etc.)
   - Test that clearCache() calls storage.clear()
   - Test resetStore() returns to initial state
7. **Offline mode test** — `test/offline.test.js`:
   - Mock AsyncStorage with cached data
   - Load app, verify store hydrates from cache
   - No network calls attempted

**Validation Steps:**

- [ ] `npm test` passes (adapters.test.js, store.test.js, offline.test.js)
- [ ] `npm run lint` passes
- [ ] `npx eas build --platform android --local` succeeds
- [ ] AsyncStorage mock data loads into store on app start
- [ ] Store state shape verified against web version

**Checklist:**

- [ ] mobile/src/adapters/mobileStorageAdapter.js (async, error-safe)
- [ ] mobile/src/adapters/mobileFetchAdapter.js (no CORS proxy)
- [ ] mobile/src/hooks/useParkingStore.js (factory init)
- [ ] test/adapters.test.js (storage + fetch tests)
- [ ] test/store.test.js (store shape + actions)
- [ ] test/offline.test.js (cache hydration)
- [ ] Verify cache keys match web: `parking_realtime_cache`, `parking_history_cache`
- [ ] docs: Update copilot_instructions.md (adapter patterns)

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Iteration 2 ✅)
- Update mobile/README.md with adapter architecture

---

#### **Iteration 3: Dashboard Screen MVP**

**Objectives:** Build real-time Dashboard screen, display live parking data, implement theme toggle (Appearance API), offline cache display, live data age clock.

**Tasks:**

1. **Create screens folder** — `mobile/src/screens/`
2. **DashboardScreen.js**:
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
3. **ParkingCard.js sub-component**:
   - Props: `data` (parking object), `now` (Date), `allOffline` (bool)
   - Display age-based color: red (≥15 min), yellow (5-15 min), green (<5 min)
   - Show approximation indicator if present
   - Tap to copy to clipboard (optional)
4. **LoadingSkeletonCard.js**:
   - Placeholder while loading
   - 3-4 rows of gray boxes
5. **Data flow**:
   - On mount, trigger `refreshCallback` (will be set by DataManager in later iteration)
   - Subscribe to store via `useShallow()` (Zustand hook)
   - Update `now` state every 1 second for live age display
   - Apply `applyApproximations()` from shared (before rendering)
6. **Theme integration**:
   - Read `Appearance.getColorScheme()` on mount
   - Store in context or state
   - Apply colors: light mode (white bg, black text), dark mode (dark bg, light text)
7. **Unit tests** — `test/screens/DashboardScreen.test.js`:
   - Mock store with sample parking data
   - Verify FlatList renders cards
   - Verify age updates every second
   - Test error state rendering
   - Test loading state rendering
   - Test empty state

**Validation Steps:**

- [ ] `npm test` passes (DashboardScreen.test.js)
- [ ] `npm run lint` passes
- [ ] Offline Emulator run: App loads, displays cached parking data if available
- [ ] Live age counter increments every 1 second
- [ ] Theme colors match light/dark modes
- [ ] No network calls on mount (cache-first)

**Checklist:**

- [ ] mobile/src/screens/DashboardScreen.js (FlatList + live clock)
- [ ] mobile/src/components/ParkingCard.js (card UI)
- [ ] mobile/src/components/LoadingSkeletonCard.js (skeleton)
- [ ] mobile/src/context/ThemeContext.js (Appearance API + storage)
- [ ] test/screens/DashboardScreen.test.js (rendering + age update)
- [ ] Integrate applyApproximations() from shared on render
- [ ] docs: copilot_instructions.md (component structure)

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

#### **Iteration 5: Data Manager, Navigation & Polish**

**Objectives:** Implement data fetching (real-time + history), set up navigation between Dashboard/Stats, add error boundaries, polish UI, finalize offline support.

**Tasks:**

1. **Create MobileDataManager.js** — Analogous to web's ParkingDataManager:
   - Fetch realtime data from two API endpoints
   - Parse responses using shared's `parseApiEntry()` + `cloneApiResults()`
   - Fetch CSV history if needed
   - Cache to mobile storage via adapter
   - Auto-refresh every 5 minutes
   - Handle errors gracefully
   - Register `refreshCallback` to store
   - **Key difference from web:** No Google Forms submission (optional for mobile MVP)
2. **App.js root structure**:
   - Setup `DataManagerProvider` (provides `useDataManager()` hook)
   - Setup React Navigation (React Navigation + React Native Navigation)
     - `createNativeStackNavigator()`
     - Two screens: Dashboard, Statistics
     - Tab navigator (bottom tabs, icons via Vector Icons)
   - Setup `ThemeProvider` (light/dark via Appearance API)
   - Setup `ErrorBoundary` (try/catch wrapper for RN)
3. **ErrorBoundary.js**:
   - Catch render errors
   - Display "Something went wrong" screen
   - Show reset button
4. **Data refresh trigger**:
   - On app launch, call `MobileDataManager.startAutoRefresh()` (5-min interval)
   - On navigation to Dashboard, trigger immediate refresh (optional)
   - On pull-to-refresh gesture (FlatList), trigger refresh
5. **Pull-to-refresh** — DashboardScreen:
   - Use FlatList's `refreshing` + `onRefresh` props
   - Show refresh spinner
   - Call store's `refreshCallback()`
6. **Unit tests** — `test/MobileDataManager.test.js`:
   - Mock fetch adapter
   - Test realtime fetch + cache cycle
   - Test history fetch + CSV parsing
   - Test error handling
   - Test auto-refresh interval setup
7. **Integration tests** — `test/integration/dataFlow.test.js`:
   - Simulate full data fetch → store update → UI render flow
   - Mock network, verify store, verify component updates

**Validation Steps:**

- [ ] `npm test` passes (MobileDataManager.test.js, integration tests)
- [ ] `npm run lint` passes
- [ ] Emulator: Dashboard auto-refreshes every 5 minutes (timer visible in logs)
- [ ] Pull-to-refresh gesture works (spinner shows, data updates)
- [ ] Navigation between Dashboard/Stats works smoothly
- [ ] Error state displays recoverable message + retry button
- [ ] App runs offline (no crashes, cached data displays)
- [ ] No console errors/warnings

**Checklist:**

- [ ] mobile/src/MobileDataManager.js (fetch + cache cycle)
- [ ] mobile/src/App.js (navigation + providers)
- [ ] mobile/src/navigation/ (stack + tab navigators)
- [ ] mobile/src/components/ErrorBoundary.js (error catch)
- [ ] mobile/src/components/PullToRefresh.js (if needed)
- [ ] test/MobileDataManager.test.js
- [ ] test/integration/dataFlow.test.js
- [ ] Verify offline cache shapes match web
- [ ] docs: Update copilot_instructions.md (navigation, data flow)

**Documentation Updates:**

- Update MIGRATION_PLAN.md Iteration Log (Iteration 5 ✅)
- Create mobile/ARCHITECTURE.md (data flow, component tree)

---

#### **Iteration 6: CI/CD, Testing Coverage & Release**

**Objectives:** Set up GitHub Actions for Expo builds, achieve 80%+ test coverage, document all iterations, tag v0.1.0-beta.0 release.

**Tasks:**

1. **GitHub Actions — Expo CI/CD** — `.github/workflows/mobile-ci.yml`:
   - **Job: lint-and-test**
     - Checkout code
     - Setup Node.js 22.x (from .nvmrc)
     - Cache dependencies
     - Prebuild shared package (`npm run build` in shared/)
     - Install mobile deps
     - Run `npm run lint` (0 errors)
     - Run `npm run test` (0 failures)
     - Run `npm run test:coverage` (report >80%)
   - **Job: build-expo**
     - Runs after lint-and-test passes
     - Install EAS CLI
     - Build APK via `eas build --platform android --local` (no EAS account, local only)
     - Upload APK as artifact
     - (iOS optional: requires macOS runner)
   - **Trigger:** Push to `feature/mobile` or PR to `main`
2. **Test coverage targets**:
   - Shared package: Already >80% (Phase 1)
   - Mobile adapters: >85% (storage, fetch error paths)
   - Mobile components: >80% (Dashboard, Statistics)
   - Store integration: >80% (all actions tested)
   - Data manager: >80% (fetch, cache, error flows)
   - **Overall mobile:** >80%
3. **Coverage report**:
   - Use Vitest's `--coverage` flag (c8 provider)
   - Generate HTML report
   - Upload to artifacts or comment on PR
4. **Version & changelog**:

   - Tag git commit: `git tag v0.1.0-beta.0`
   - Create mobile/CHANGELOG.md:

     ```markdown
     # Changelog

     ## [0.1.0-beta.0] - 2025-12-29

     ### Added

     - Initial Expo/React Native mobile app scaffolding
     - Mobile storage adapter (AsyncStorage)
     - Mobile fetch adapter (direct, no CORS proxy)
     - Zustand store integration with shared package
     - Dashboard screen with real-time parking data
     - Statistics screen with victory-native charts
     - Theme toggle (light/dark via Appearance API)
     - Auto-refresh (5-min interval)
     - Pull-to-refresh gesture
     - Error boundaries and offline cache hydration
     - Full CI/CD pipeline (GitHub Actions)

     ### Known Limitations

     - Google Forms submission not yet implemented
     - iOS builds not validated (Android only)
     - E2E testing deferred to Phase 3

     ### Dependencies

     - React Native 0.73+
     - Expo 50+
     - Zustand 5.x (from shared)
     - victory-native 36+ (charting)
     - AsyncStorage 1.x
     ```

5. **Unit tests expansion**:
   - Ensure all utility functions tested
   - Ensure all components tested (happy path + error states)
   - Ensure all adapters tested (with mocks)
6. **E2E validation (manual)** — Run on emulator/device:
   - [ ] App launches, shows Dashboard (cached or live data)
   - [ ] Real-time data refreshes every 5 min
   - [ ] Pull-to-refresh works
   - [ ] Switch to Statistics, charts render
   - [ ] Switch back to Dashboard, data persists
   - [ ] Theme toggle changes colors
   - [ ] Close app, reopen → data from cache
   - [ ] Clear cache from settings → fresh load on next refresh
   - [ ] Network error → graceful fallback to cache
7. **Documentation finalization**:
   - Update MIGRATION_PLAN.md with complete Phase 2 Iteration Log
   - Update mobile/README.md with full setup + development guide
   - Update root README.md with mobile section
   - Update copilot-instructions.md with mobile-specific patterns
8. **Semantic versioning**:
   - Shared: v0.1.0-alpha.0 (Phase 1 complete)
   - Mobile: v0.1.0-beta.0 (Phase 2 MVP complete)
   - Web: Remains on current version (no breaking changes)

**Validation Steps:**

- [ ] `npm run lint` passes in mobile (0 errors)
- [ ] `npm run test` passes (0 failures)
- [ ] `npm run test:coverage` reports >80% coverage
- [ ] GitHub Actions workflow runs successfully (lint, test, build)
- [ ] APK artifact generated and downloadable
- [ ] E2E manual testing on Android emulator (all 8 checklist items pass)
- [ ] Release tag `v0.1.0-beta.0` created
- [ ] All documentation updated

**Checklist:**

- [ ] .github/workflows/mobile-ci.yml (lint, test, build jobs)
- [ ] mobile/vitest.config.js configured for coverage
- [ ] mobile/package.json with test:coverage script
- [ ] All existing tests updated to >80% coverage
- [ ] mobile/CHANGELOG.md (v0.1.0-beta.0)
- [ ] mobile/README.md (full setup guide)
- [ ] MIGRATION_PLAN.md Phase 2 Iteration Log complete
- [ ] copilot-instructions.md updated (mobile section)
- [ ] Git tag: v0.1.0-beta.0

**Documentation Updates:**

- Update MIGRATION_PLAN.md Phase 2 Summary (all 6 iterations ✅)
- Create mobile/CHANGELOG.md
- Create mobile/ARCHITECTURE.md
- Update README.md (add mobile section)
- Update copilot-instructions.md

---

### Further Considerations

1. **Google Forms submission** — Currently web-only (no-cors). Should Phase 3 add it to mobile, or defer indefinitely? Recommend Phase 3 if analytics needed.

2. **iOS support** — Phase 2 targets Android only (emulator). iOS would require macOS CI runner + Apple provisioning. Build separately in Phase 3?

3. **E2E testing** — Manual E2E in Iteration 6. Should Phase 3 add Detox or other RN E2E framework for automated CI?

4. **Chart library trade-off** — victory-native chosen (mature, Expo-friendly, SVG-based). Alternative: react-native-chart-kit (simpler but less flexible). Stick with victory-native?

5. **Shared package versioning** — Once mobile ships (v0.1.0-beta.0), shared is pinned to v0.1.0-alpha.0. Phase 3 should bump shared → v0.1.0-rc.0 once mobile stabilizes?

6. **Web + Mobile parity** — Dashboard UI structure ported; Statistics charts differ (echarts vs. victory-native). Acceptable, or maintain design consistency in Phase 3?

7. **Build automation** — Phase 2 includes lint/test/build CI. Should Phase 3 add auto-deployment to Expo Preview or App Store testflight?
