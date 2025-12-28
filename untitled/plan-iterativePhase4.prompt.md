## Phase 4 Overview

MVP definition
- A minimal Expo app that boots on device/emulator, fetches live parking data from one API endpoint, displays the current free spaces count with a refresh action, and persists the last successful result locally.

Success criteria
- Runs on iOS Simulator and Android Emulator (Expo).
- Fetches one live endpoint without a CORS proxy and shows loading/error states.
- Displays a single parking group count and last updated time.
- Persists last result to device storage and restores on app launch.
- Build/run via workspace scripts; no reliance on prior mobile code.

## Green-Field Assumptions

Intentionally discarded
- Any existing mobile code, screens, navigation, adapters, or structure under `packages/mobile/`.
- Prior decisions about mobile architecture, libraries, or file layout.

Reusable from shared (non-mobile)
- `@free-parking/shared` modules: `config.js` (API_URLS, CSV_URL, CACHE_KEY_*), `dateUtils.js`, `parkingUtils.js`, `parsers.js`, and patterns from `parkingStore.js`.
- Storage adapter interface in `packages/shared/src/storage.js` (implement AsyncStorage for mobile).
- Web-only constraints are reference only; do not use `CORS_PROXY` on mobile.

## Iterative Strategy (Phase 4.x)

### Phase 4.0 — Boot Minimal App
- Objective: Start an empty Expo app that renders a simple screen on device/emulator.
- Scope: Expo scaffold, minimal `App` component, no navigation, no data.
- Files/components:
  - Create `packages/mobile/package.json`, `packages/mobile/app.json`, `packages/mobile/index.js`, `packages/mobile/src/App.jsx`.
- Visible/testable:
  - App boots showing “Parking” placeholder on iOS/Android (Expo).
- Acceptance criteria:
  - `npm run dev:mobile` launches Expo; app renders a single view on both platforms.

### Phase 4.1 — Fetch One Endpoint and Render Value
- Objective: Fetch GreenDay free spaces from `API_URLS[0]` and display it.
- Scope: Simple fetch module and basic UI with loading/error states.
- Files/components:
  - Add `packages/mobile/src/api/fetchRealtime.js` (direct fetch; no CORS proxy).
  - Update `packages/mobile/src/App.jsx` to call fetch on mount and render value.
- Visible/testable:
  - Tap “Refresh” to re-fetch; shows loading spinner, value or error text.
- Acceptance criteria:
  - Successful fetch renders a number; failed fetch shows an error message.

### Phase 4.2 — Persist Last Result (AsyncStorage)
- Objective: Cache last successful result and timestamp; restore on launch.
- Scope: Implement mobile storage adapter and integrate with screen state.
- Files/components:
  - Create `packages/mobile/src/adapters/storageMobile.js` implementing `getItem`, `setItem`, `removeItem` using AsyncStorage aligned to `packages/shared/src/storage.js`.
  - Wire restore-on-launch and save-on-success in `App.jsx`.
- Visible/testable:
  - Relaunch app shows cached value and last updated time before network fetch.
- Acceptance criteria:
  - Cached payload survives app restart; overwrite on successful refresh.

### Phase 4.3 — Integrate Shared Config and Utilities
- Objective: Use `@free-parking/shared` for config/constants and timestamp handling.
- Scope: Replace hardcoded URL and timestamp parsing with shared modules.
- Files/components:
  - Import `API_URLS`, `CACHE_KEY_REALTIME` from `packages/shared/src/config.js`.
  - Use `dateUtils`/`parkingUtils` for timestamp normalization and age label.
- Visible/testable:
  - UI shows “last updated” and age label derived via shared utils.
- Acceptance criteria:
  - Network URL sourced from shared; age calculation matches web behavior.

### Phase 4.4 — Error/Loading UX and Manual Refresh
- Objective: Improve UX with clear states and manual refresh.
- Scope: Buttons and state handling; debounce/throttle where needed.
- Files/components:
  - Enhance `App.jsx` with `ActivityIndicator`, error banner, “Refresh” button.
- Visible/testable:
  - User can trigger refresh; clear indication of loading, success, error.
- Acceptance criteria:
  - No duplicate requests; button disabled while loading; consistent state transitions.

### Phase 4.5 — Add Second Group and Simple List
- Objective: Display both parking groups as vertical cards.
- Scope: Fetch both endpoints and render two items with normalized names.
- Files/components:
  - Extend fetch to return two results; map `Bank_1` → “Uni Wroc” naming.
  - Create `packages/mobile/src/components/ParkingCard.jsx`.
- Visible/testable:
  - Two cards render with free spaces and age labels; refresh updates both.
- Acceptance criteria:
  - Both endpoints handled; UI stays responsive on success/failure per card.

### Phase 4.6 — Settings Screen (Cache + Refresh)
- Objective: Introduce a minimal second screen only when needed.
- Scope: Simple navigation and settings actions; no charts yet.
- Files/components:
  - Add bottom-tabs with “Dashboard” and “Settings”.
  - `packages/mobile/src/screens/SettingsScreen.jsx` with “Clear Cache” and “Force Refresh”.
- Visible/testable:
  - Navigate to Settings; clear local cache; return to Dashboard to re-fetch.
- Acceptance criteria:
  - Cache clears reliably; forced refresh triggers fresh network calls.

### Phase 4.7 — Basic History Preview (Optional Slice)
- Objective: Fetch CSV and render a simple trend preview (minimal viability).
- Scope: Shared CSV URL + parse; micro-chart via `react-native-svg`.
- Files/components:
  - `packages/mobile/src/screens/HistoryPreview.jsx` (inline sparkline).
  - Use shared `CSV_URL` and basic parsing (skip dedupe/Google Form submission).
- Visible/testable:
  - A simple line/sparkline of recent values appears; does not block Dashboard.
- Acceptance criteria:
  - History fetch succeeds independently; chart renders with minimal legend/labels.

### Phase 4.8 — Stabilization and Device Testing
- Objective: Validate MVP across devices and polish core flows.
- Scope: Test on iOS Simulator + Android Emulator; basic performance checks.
- Files/components:
  - Minor fixes only; no new features.
- Visible/testable:
  - Smooth boot, fetch, refresh, cache restore; acceptable load times.
- Acceptance criteria:
  - MVP behaviors are reliable; ready for submissions/build pipelines later.
