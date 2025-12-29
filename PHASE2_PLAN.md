# Phase 2 — Mobile Expo MVP Migration Plan

TL;DR: Build a plain-JavaScript Expo + React Native mobile app that reuses the existing shared package (via `file:../shared`). Work iteratively from an empty Expo project through dashboard, charts/statistics, offline cache hydration, and CI. Each iteration is self-contained, runnable offline in Expo and on an Android emulator, includes lint/format/test steps, CI job instructions, and documentation updates. Keep shared pure JS, adapter-driven environment boundaries, and high test coverage for parsing/transforms/store reducers. Maintain semantic versioning and changelog per release.

Notes
- Language/platform: Plain JavaScript (no TypeScript), React Native (Expo managed preferred).
- Shared package: reference as `"parking-shared": "file:../shared"` in `mobile/package.json`. Metro must include `../shared` in `watchFolders`.
- Charts: use RN-compatible libs (recommend `victory-native` + `react-native-svg`). Replace web-only echarts.
- Storage: use `@react-native-async-storage/async-storage` adapter.
- Tests: reuse shared Vitest tests for pure logic; add Jest (or React Native Testing Library) for RN UI tests.
- CI: add GitHub Actions workflow `mobile-ci.yml`. Do not deploy to Expo web.

---

Iteration 1 — Empty default Expo project (baseline)
- Goal: scaffold a minimal Expo app, confirm shared import works, Metro watch configured, CI skeleton added.
- Commands
  - Scaffold:
    ```bash
    npx create-expo-app mobile --template blank --name free-parking-mobile
    cd mobile
    npm install
    ```
  - Add shared dependency:
    ```bash
    # in mobile/package.json add:
    "parking-shared": "file:../shared"
    npm install
    ```
  - Start offline:
    ```bash
    npx expo start --offline
    ```
  - Run Android emulator:
    ```bash
    npx expo start
    # press `a` or run:
    npx expo start --android
    ```
- Checklist
  - Functions/components to implement
    - `mobile/App.jsx` minimal app that imports `shared/dateUtils.js` and renders a Home placeholder.
  - State/data handling to add
    - None beyond confirming shared imports.
  - UI slices to build
    - App shell: `Header`, `Home` placeholder.
  - Validation steps
    - Expo starts offline and shows app in Android emulator.
    - Run lint and format:
      ```bash
      npm run lint
      npm run format
      ```
    - Run shared tests:
      ```bash
      npm test
      ```
  - CI/CD steps
    - Add `.github/workflows/mobile-ci.yml` skeleton:
      - checkout, node setup, install, lint, run `npm test` (shared tests).
    - Do not include Expo web deploy.
  - Documentation updates
    - Add `PHASE2_MIGRATION_PLAN.md` (this file).
    - Add `mobile/README.md` with run/test/lint commands.
    - Add short Iteration 1 instructions to `copilot_instructions.md`.

---

Iteration 2 — RN adapters + thin DataManager
- Goal: create RN fetch/storage adapters and a thin DataManager that uses shared transforms.
- Commands
  ```bash
  npm install @react-native-async-storage/async-storage react-native-safe-area-context react-native-svg
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `mobile/src/adapters/mobileFetchAdapter.js` (wrap global fetch, centralize endpoints).
    - `mobile/src/adapters/mobileStorageAdapter.js` (AsyncStorage wrapper implementing the same keys/API as `webStorageAdapter`).
    - `mobile/src/DataManager.js` (thin orchestrator: fetch -> shared/dataTransforms -> storage).
  - State/data handling to add
    - `mobile/src/store/parkingStore.js` which calls `createParkingStore(adapters)` from shared.
  - UI slices to build
    - Home shows "Last updated" timestamp read from store.
  - Validation steps
    - Offline: `npx expo start --offline` and emulator shows timestamp from shared util.
    - Lint/format:
      ```bash
      npm run lint
      npm run format
      ```
    - Tests:
      - Unit tests for adapters (Jest or Vitest).
      - Run shared tests.
  - CI/CD steps
    - Update `mobile-ci.yml` to run adapter tests plus shared tests.
  - Documentation updates
    - Update `copilot_instructions.md` with adapter API contract and how to wire adapters into store.
    - Document AsyncStorage keys to match shared cache shapes.

---

Iteration 3 — Dashboard shell + store wiring
- Goal: implement Dashboard container, wire store, load realtime list (no charts).
- Commands
  ```bash
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `mobile/src/screens/Dashboard.jsx`
    - `mobile/src/components/ParkingCard.jsx`
    - `mobile/src/components/LoadingSkeleton.jsx`
  - State/data handling to add
    - `useParkingStore()` hook wrapping shared store; selectors: `realtime`, `isLoading`, `lastUpdated`.
    - Wire `DataManager` single fetch to populate store.
  - UI slices to build
    - List of `ParkingCard` items, loading skeleton.
  - Validation steps
    - App renders list in emulator offline.
    - Lint/format and unit tests for `ParkingCard` and store reducers.
  - CI/CD steps
    - CI runs RN unit tests and lint.
  - Documentation updates
    - Dashboard iteration notes in `mobile/README.md` and `copilot_instructions.md`.

---

Iteration 4 — Realtime fetch + cache hydration
- Goal: implement real fetch + cache hydration and persistence using shared transforms.
- Commands
  ```bash
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `DataManager.fetchRealtime()` uses `mobileFetchAdapter` and `shared/dataTransforms`.
    - `DataManager.hydrateFromCache()` reads AsyncStorage and hydrates store.
  - State/data handling to add
    - Store actions: `hydrateCache()`, `setRealtime()`, `setLastFetched()`.
    - Persist store snapshots to AsyncStorage on change.
  - UI slices to build
    - Dashboard shows online/offline indicator + last-updated status.
  - Validation steps
    - Seed cache, run emulator offline: UI shows cached data.
    - Tests: transform unit tests and store reducer tests pass.
    - Lint/format OK.
  - CI/CD steps
    - CI runs transform tests and store tests. Ensure `mobile-ci.yml` runs shared tests too.
  - Documentation updates
    - Document cache keys & hydration flow in `mobile/README.md`.

---

Iteration 5 — Basic charts (victory-native)
- Goal: add `victory-native` charts to Dashboard for occupancy visualization.
- Commands
  ```bash
  npx expo install react-native-svg
  npm install victory-native
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `mobile/src/components/OccupancyChart.jsx` using `victory-native`.
    - `mobile/src/utils/chartDataAdapter.js` (convert shared time-series).
  - State/data handling to add
    - Derived selector `chartData` computed from store `realtime/history`.
  - UI slices to build
    - Chart above list on Dashboard.
  - Validation steps
    - Chart renders in emulator offline.
    - Unit tests for `chartDataAdapter`.
    - Lint/format OK.
  - CI/CD steps
    - CI ensures chart-related tests run; verify native dependency presence in Expo managed workflow.
  - Documentation updates
    - Add note about chart libs in `copilot_instructions.md`.

---

Iteration 6 — Delivery statistics + history CSV parsing
- Goal: implement `Statistics` screen with historical charts and reuse shared transforms for CSV history parsing.
- Commands
  ```bash
  # if using papaparse
  npm install papaparse
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `mobile/src/screens/Statistics.jsx`
    - `mobile/src/components/HistoryChart.jsx`
    - `DataManager.fetchHistory()` calling shared `dataTransforms.parseHistory()`
  - State/data handling to add
    - `history` slice in store; selectors for aggregated stats.
  - UI slices to build
    - Multi-chart `Statistics` screen with line/area charts.
  - Validation steps
    - Seed history CSV, run emulator offline: charts display historical data.
    - Tests: history parsing coverage high (>90% for transforms).
    - Lint/format OK.
  - CI/CD steps
    - Ensure shared parsing tests are executed in CI.
  - Documentation updates
    - Document history seeding and parsing in `mobile/README.md` and `copilot_instructions.md`.

---

Iteration 7 — Offline-first polish & background sync
- Goal: implement background sync queue, offline retry, and user-visible sync status.
- Commands
  ```bash
  npx expo start --offline
  ```
- Checklist
  - Functions/components to implement
    - `mobile/src/offline/syncManager.js` (queue, retry, NetInfo connectivity listener).
    - `mobile/src/components/SyncBanner.jsx`
  - State/data handling to add
    - `syncQueue` slice persisted via AsyncStorage.
    - Actions to enqueue/dequeue and optimistic updates.
  - UI slices to build
    - Sync status banner and retry control.
  - Validation steps
    - Simulate offline post then reconnect: queued actions are sent.
    - Tests for `syncManager` queue logic.
    - Lint/format OK.
  - CI/CD steps
    - Add unit/integration tests for sync manager in CI.
  - Documentation updates
    - Document offline queue semantics and limitations.

---

Iteration 8 — Release prep, semantic versioning, optional native dev build
- Goal: finalize CI for releases, semantic versioning, changelog automation; optionally produce APK for QA.
- Commands
  ```bash
  npm install --save-dev standard-version
  npm run release # configure script to run standard-version
  # Optional local dev build (native toolchain required)
  npx expo prebuild -p android
  cd android && ./gradlew assembleDebug
  ```
- Checklist
  - Functions/components to implement
    - Add in-app About screen showing app version.
  - State/data handling to add
    - None.
  - UI slices to build
    - Settings/About page with version + changelog link.
  - Validation steps
    - CI runs tests, lint, and `npm run release` on tag pipeline.
    - Optional: produce APK via Gradle (local or CI self-hosted).
  - CI/CD steps
    - Mobile CI workflows:
      - `tests` job: lint + unit tests
      - `build` job: optional `expo prebuild` + Gradle assemble (document self-hosted/Cloud alternative: EAS)
      - `release` job: on git tag, run `standard-version`, add release notes and tag.
  - Documentation updates
    - Document release flow in MIGRATION_PLAN.md and `copilot_instructions.md`.

---

Iteration 9 — Tests & coverage hardening
- Goal: increase coverage for shared transforms and store reducers; enforce thresholds in CI.
- Commands
  ```bash
  npm run test -- --coverage
  ```
- Checklist
  - Functions/components to implement
    - Add more unit tests for `shared/dataTransforms.js`, `shared/parkingUtils.js`, and store reducers.
  - State/data handling to add
    - None.
  - UI slices to build
    - None.
  - Validation steps
    - Coverage thresholds (example: 90% for transforms) enforced in CI; tests fail if below threshold.
  - CI/CD steps
    - Add coverage job that fails on under-threshold.
  - Documentation updates
    - Add coverage target and testing guidelines to `copilot_instructions.md`.

---

Iteration 10 — Accessibility, E2E basics, handoff
- Goal: finalize UX polish, accessibility labels, lightweight E2E tests and handoff docs.
- Commands
  ```bash
  # example E2E with Detox or simple RN Testing Library scenarios
  npm run e2e
  ```
- Checklist
  - Functions/components to implement
    - Accessibility props across major components.
    - E2E basic scenarios (open Dashboard, view chart, navigate to Statistics).
  - State/data handling to add
    - None.
  - UI slices to build
    - Final visual polish and accessibility fixes.
  - Validation steps
    - Manual device check + E2E smoke tests in CI (optional).
    - Lint/format/tests pass.
  - CI/CD steps
    - Optional E2E job: runs on emulator runner or cloud device provider.
  - Documentation updates
    - Final `mobile/README.md`, update MIGRATION_PLAN.md status, finalize `copilot_instructions.md` per-iteration runbook.

---

Per-iteration required checklist summary (applies to every iteration)
- Run offline in Expo:
  ```bash
  npx expo start --offline
  ```
- Run on Android emulator:
  ```bash
  npx expo start
  # then `a` or:
  npx expo start --android
  ```
- Lint and format:
  ```bash
  npm run lint
  npm run format
  ```
- Run unit and integration tests:
  ```bash
  npm test
  ```
- CI/CD:
  - Add/extend `mobile-ci.yml` to run install, lint, tests. For builds or native artifacts, document EAS or Gradle approach and make builds optional in CI.
- Docs:
  - Update MIGRATION_PLAN.md with the iteration summary and status.
  - Update `copilot_instructions.md` with iteration checklist and commands.

Essential technical considerations (actionable)
- Metro config (mobile/metro.config.js) must include:
  - `watchFolders: [path.resolve(__dirname, '../shared')]`
  - Resolver adjustments if `exports` causes issues.
- Shared package:
  - Keep shared output ESM/CJS-compatible. If Metro has issues, prefer importing from src or ensure shared `package.json` exposes `module` and `main`.
- Adapters:
  - Create `mobile/src/adapters` implementing interfaces from types.js. Keep shared logic environment-agnostic.
- Charts:
  - Use `victory-native` + `react-native-svg` (recommended). Extract data transforms into shared for testability.
- CSV parsing:
  - Prefer using shared `dataTransforms`. If `papaparse` is needed, confirm RN compatibility or parse in shared JS.
- Tests:
  - Keep parsing/transforms/store reducers heavily tested (Vitest ok); RN UI tests with Jest + react-native-testing-library.
- Versioning & changelog:
  - Run `standard-version` in release pipeline; tag releases per iteration.

Semantic versioning & changelog
- Bump semver at iteration milestones (e.g., initial mobile release v0.1.0).
- Maintain `CHANGELOG.md` via `standard-version` or similar and add changelog entries per iteration in CI release job.

Files to add/modify (actionable checklist to implement across iterations)
- New mobile project:
  - `mobile/package.json` (with `parking-shared` file reference and scripts)
  - `mobile/metro.config.js`
  - `mobile/App.jsx`, `mobile/src/*` components, adapters, store
  - `mobile/README.md`
  - `.github/workflows/mobile-ci.yml`
- Docs:
  - Update root MIGRATION_PLAN.md (high-level)
  - Update `copilot_instructions.md` (iteration runbook and adapter contracts)

Acceptance criteria for Phase 2 MVP
- App runs offline in Expo and on Android emulator for every iteration.
- Shared logic reused; adapters isolate platform specifics.
- Charts rendered using RN-compatible library.
- Cache hydration and offline sync implemented and tested.
- CI runs lint, tests (shared + mobile), and enforces coverage thresholds for transforms.
- Documentation updated and release process defined.

---

If you want, I can:
- (A) produce this file content as `PHASE2_MIGRATION_PLAN.md` (I will only prepare the content — you or another agent should commit it), or
- (B) refine any iteration to add exact file paths and example tests, or
- (C) scaffold the `mobile/` Expo project locally (requires switching from planning mode to implementation).

Which do you want next?