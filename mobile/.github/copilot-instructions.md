# Copilot Instructions for the `mobile/` Subproject (2026‑02‑21)

This file lives inside `mobile/` so an AI agent focusing on the Expo/React‑Native app picks up the right context.  It supplements the repo‑level instructions; do **not** delete the root copy.

## Big picture

- The mobile app is an Expo/React‑Native project built on top of the `parking-shared` package.
- Behavior is driven by a single global store (Zustand) created by `createParkingStore` in `shared`.
  - Adapters (`src/adapters/*`) provide platform‑specific `storage`, `fetch`, and optional `logger` implementations.
  - `useParkingStore` (in `src/hooks/useParkingStore.js`) assembles adapters once at startup and exports the hook used throughout the app.
- The UI lives under `src/`.
  - `App.js` wires `ThemeContext` and `ParkingDataProvider` around the dashboard and statistics screens.
  - Orientation support is handled by a tiny hook `src/hooks/useOrientation.js` (width/height based) and is used by layouts.
- Data flows:
  1. `ParkingDataProvider` fetches/parses remote feeds and writes to the shared store.
  2. Components call `useParkingStore` to read `realtimeData`, `historyData`, etc.
  3. Persisted cache uses keys `parking_realtime_cache` and `parking_history_cache` in AsyncStorage; keep these identical to web/shared.
- The project prefers hard‑coded constants (e.g. `APP_THEME` in `App.js`) only when documented clearly.

## Developer workflows

1. **Getting started**
   ```bash
   cd mobile
   npm install        # Node 22.12.0, see root .nvmrc
   npm run lint
   npm test           # or npm run test:watch
   npm run start -- --offline  # runs Metro bundler locally
   ```
2. **Running on device/emulator**
   - `npm run android` / `npm run ios`
   - `npm run android:clear` to restart Metro with a clean cache.
   - Release builds:
     - `npm run android:build` then `npm run android:install` or `android:deploy`.
3. **Adding dependencies**
   - `npm run xostinstall` ensures AsyncStorage is added without touching package.json (used by CI).
   - `expo-cli` commands may require `expo prebuild` when native modules are added.
4. **Tests**
   - All tests live under `mobile/test` and run via Jest.
   - Use `@testing-library/react-native` for component rendering but most logic is unit tested.
   - Mocks are pervasive:
     - `@react-native-async-storage/async-storage` is mocked at top of nearly every file.
     - `react-native` hooks like `useWindowDimensions` are mocked to simulate orientation.
     - `global.fetch` is stubbed directly in adapter/unit tests.
     - The shared package (`../shared/src/index.js`) is often mocked to control store behaviour (see `offline.test.js`).
   - To temporarily skip a flaky test, append `.skip` to the filename (see `ThemeContext.test.js.skip`).
5. **Powershell frorbiden**
   No workflow done by copilot should use Powershell scripting because it is bad tool, contraproductive and noone in world should use it. There are normal tools like bash or eventually cmd.exe

## Conventions & patterns

- **Adapters**
  - Keep them tiny: `createMobileStorageAdapter` and `createMobileFetchAdapter` simply wrap AsyncStorage and global fetch.
  - Log with `debugLog` from `src/config/debug.js` to avoid polluting test output.
  - Always add cache‑bust query param in fetch adapter; tests exercise both `?` and `&` cases.
- **Cache keys** must match those declared in `shared` (search for `parking_realtime_cache` in repo).
- **Orientation support**
  - `useOrientation` returns `'landscape'` when width > height; nothing else should be used.
  - The PR adding runtime landscape support (current branch) adds `expo-screen-orientation` – remember to install and prebuild if modifying.
- **Theme context** is in `src/context/ThemeContext.js`; use `useTheme()` and follow existing test patterns.
- **Debug logging** is enabled via `debugLog` helper which checks environment variables; do not import `console.log` directly.
- **File paths**
  - Within mobile code, import shared via relative path (e.g. `import { applyApproximations } from 'parking-shared';`).
  - Tests may import shared with Metro‑relative path (`../shared/src/index.js`) to verify bundler configuration.
- **Avoid editing**
  - `node_modules/`, `android/**/build/`, `ios/**/build/`, `.expo/`, `.git/` – these are excluded from scanning.

## Integration points

- The app depends on `parking-shared` (local file path). Changes to shared often require bumping version in `mobile/package.json` and re‑running `npm install`.
- AdMob code is included (`react-native-google-mobile-ads`); most work is in `src/utils/AdMobManager.js` and associated docs (`ADMOB_SETUP.md`).
- Orientation and system UI settings use Expo APIs; look at `expo-status-bar` and `expo-system-ui` imports in `App.js`.

## Delivering code

- Ensure all mobile tests pass before marking a ticket done.
- Lint errors must be fixed; use `npm run lint` within `mobile`.
- When adding features, update or add tests under `mobile/test` and/or shared tests if behavior crosses boundaries.
- Mention in PR description if native dependencies were added (e.g. expo modules) since reviewers need to run `expo prebuild`.
- Don’t suggest or create branches/PRs automatically; all suggestions are drafts for a human to review.

> ⚠️ **Note:** this file is intentionally specific to the `mobile/` subproject.  If you have questions about shared logic or web, see the root `.github/copilot-instructions.md`.

Please review and let me know if any domain‑specific details are missing or unclear!  I'm happy to iterate.  
