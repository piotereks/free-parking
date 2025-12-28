### Purpose
Short guide for AI coding agents to be immediately productive in this repo.

This monorepo hosts two first‑class apps developed in parallel: a Vite + React web SPA and an Expo React Native mobile app (Android/iOS). This document covers both at a high level and links to package‑specific guides.

### Big picture
- Monorepo with three packages:
  - Web SPA (React + Vite): [packages/web/src/main.jsx](packages/web/src/main.jsx#L1-L20) -> [packages/web/src/App.jsx](packages/web/src/App.jsx#L1-L40)
  - Shared business logic/constants: [packages/shared/src](packages/shared/src)
  - React Native mobile app: [packages/mobile/src](packages/mobile/src)
- Web domains:
  - Real-time dashboard UI: [packages/web/src/Dashboard.jsx](packages/web/src/Dashboard.jsx#L1-L200)
  - Historical/statistics views: [packages/web/src/Statistics.jsx](packages/web/src/Statistics.jsx)
- Data provider: `ParkingDataProvider` centralizes fetching, caching and submission logic ([packages/web/src/ParkingDataManager.jsx](packages/web/src/ParkingDataManager.jsx#L1-L60)). UI components consume via `useParkingData()`.

### Key flows & integration points
- Real-time API endpoints and other config constants live in shared: [packages/shared/src/config.js](packages/shared/src/config.js). The web app consumes them via `@free-parking/shared` (see imports in [packages/web/src/ParkingDataManager.jsx](packages/web/src/ParkingDataManager.jsx#L1-L40)). Responses are cached to `localStorage` keys `parking_realtime_cache` and `parking_history_cache`.
- Historical data is fetched from a published Google Sheets CSV (`CSV_URL`) and parsed with `papaparse`.
- New API samples are submitted to a Google Form (`GOOGLE_FORM_URL`) using `FORM_ENTRIES` mapping in shared; the values currently contain placeholder entry IDs and `TODO` comments — do not assume these are valid.
- The web app applies a CORS proxy (`CORS_PROXY`) to external fetches inside `ParkingDataManager`. Maintain this pattern when adding new web fetches; mobile does not need the proxy.

### Developer workflows (concrete commands)
- From repo root (workspaces):
  - Web: `npm run dev:web`, `npm run build:web`, `npm run lint:web`, `npm run test:web`
  - Mobile (Expo): `npm run dev:mobile`, `npm run dev:mobile:ios`, `npm run dev:mobile:android`, `npm run build:mobile:preview`, `npm run submit:mobile:ios`, `npm run submit:mobile:android`
- From the web package:
  - `cd packages/web`
  - Start dev: `npm run dev`
  - Build: `npm run build`
  - Preview: `npm run preview`
  - Lint: `npm run lint`
  - Tests (vitest): `npm run test:run` or `npm run test:watch`
- From the mobile package:
  - `cd packages/mobile`
  - Start dev (Expo): `npm run dev`
  - iOS simulator: `npm run dev:ios`
  - Android emulator/device: `npm run dev:android`
  - Builds: `npm run build:ios`, `npm run build:android`, `npm run build:preview`
  - Submissions: `npm run submit:ios`, `npm run submit:android`

Note: On Windows, prefer `cmd.exe`/PowerShell commands rather than bash/mingw for reliability with local toolchains. Expo mobile development requires platform toolchains (Android Studio/SDK, Xcode for iOS) when running locally.

### Project-specific conventions & patterns
- Single global data provider (web): add/consume parking data via `ParkingDataProvider` and `useParkingData()` rather than ad‑hoc fetches.
- Mobile parity: mobile reuses shared logic (`@free-parking/shared`) and uses an AsyncStorage‑based adapter (e.g., `packages/mobile/src/adapters/storageMobile.js`). Web uses `packages/web/src/adapters/storageWeb.js` (localStorage).
- Caching: use `CACHE_KEY_REALTIME` and `CACHE_KEY_HISTORY` to keep UI instant on load across platforms.
- Timestamp parsing: API timestamps like "YYYY‑MM‑DD HH:MM:SS" are normalized with `replace(' ', 'T')` before `new Date(...)`.
- Theme handling (web): global theme state is controlled by [packages/web/src/ThemeContext.jsx](packages/web/src/ThemeContext.jsx#L1-L80) and stored under `parking_theme` in `localStorage`.
- Naming: `Bank_1` is normalized to `Uni Wroc` in the UI (see `Dashboard`).

### Files noteworthy for changes/PRs
- Web data & sync: [packages/web/src/ParkingDataManager.jsx](packages/web/src/ParkingDataManager.jsx#L1-L400)
- UI entry & routing (web): [packages/web/src/main.jsx](packages/web/src/main.jsx#L1-L20), [packages/web/src/App.jsx](packages/web/src/App.jsx#L1-L40)
- Dashboard view (web): [packages/web/src/Dashboard.jsx](packages/web/src/Dashboard.jsx#L1-L300)
- Theme and utilities (web): [packages/web/src/ThemeContext.jsx](packages/web/src/ThemeContext.jsx#L1-L80)
- Styles (web): [packages/web/src/index.css](packages/web/src/index.css), [packages/web/src/App.css](packages/web/src/App.css); Tailwind config at [packages/web/tailwind.config.js](packages/web/tailwind.config.js)
- Shared config/constants: [packages/shared/src/config.js](packages/shared/src/config.js) (API URLs, CSV URL, cache keys, Google Form entries, CORS proxy)

### Safety, secrets, and TODOs
- `FORM_ENTRIES` in shared contains placeholder Google Form entry IDs; never hardcode private credentials. Prefer environment variables or a secure secret store if real IDs are needed.
- No backend: all network calls are done client-side; adding server-side code changes deployment expectations and CI.
- Tests exist for the web app under [packages/web/test](packages/web/test). Use Vitest (`npm run test:web` from root or `npm run test:run` in the web package). Focus on `ParkingDataManager` and shared parser functions when adding complex logic.

### When you edit code — quick checklist for PRs
- Run lint and dev locally to validate UI behavior (`npm run lint:web`, `npm run dev:web` from root, or package-local scripts in `packages/web`).
- When changing fetch URLs, preserve the `CORS_PROXY` pattern in the web app or explain why it's removed.
- If you change CSV headers or timestamp keys, update `COLUMN_ALIASES` in [packages/shared/src/config.js](packages/shared/src/config.js) and ensure related parsing logic in shared remains consistent.

### If something's unclear
- Ask for the Google Form entry mapping before modifying `FORM_ENTRIES` or automatic submission paths.
- Confirm whether the deployed static files under [parking-deploy/docs/html/parking/](parking-deploy/docs/html/parking/) are authoritative before changing build outputs.

