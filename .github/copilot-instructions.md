### Purpose
Short guide for AI coding agents to be immediately productive in this repo (a small Vite + React SPA showing parking availability).

### Big picture
- Frontend-only single-page app built with React + Vite. Entry: [src/main.jsx](src/main.jsx#L1-L20) -> [src/App.jsx](src/App.jsx#L1-L40).
- Two main domains:
  - Real-time dashboard UI: [src/Dashboard.jsx](src/Dashboard.jsx#L1-L200)
  - Historical/statistics views: [src/Statistics.jsx](src/Statistics.jsx)
- Data provider: `ParkingDataProvider` centralizes fetching, caching and submission logic ([src/ParkingDataManager.jsx](src/ParkingDataManager.jsx#L1-L60)). UI components consume via `useParkingData()`.

### Key flows & integration points
- Real-time API endpoints are defined in `API_URLS` inside [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx#L1-L40). Responses are cached to `localStorage` keys `parking_realtime_cache` and `parking_history_cache`.
- Historical data is fetched from a published Google Sheets CSV (`CSV_URL`) and parsed with `papaparse`.
- New API samples are submitted to a Google Form (`GOOGLE_FORM_URL`) using `FORM_ENTRIES` mapping; the code currently contains placeholder entry IDs and `TODO` comments — do not assume these are valid.
- A CORS proxy constant (`CORS_PROXY`) is applied to API fetches inside `ParkingDataManager` — maintain this pattern when adding external fetches.

### Developer workflows (concrete commands)
- Start dev server: `npm run dev` (runs `vite`) — serves the SPA with HMR.
- Build production bundle: `npm run build` (runs `vite build`).
- Preview production build: `npm run preview` (build then `vite preview`).
- Lint: `npm run lint` (runs `eslint .`).

Note: When running local dev tasks from Windows, prefer the `cmd.exe`/PowerShell command variants (not `bash`/mingw) for reliability with Windows toolchains (Android SDK, `nvm-windows`, Visual Studio, etc.).

### Project-specific conventions & patterns
- Single global data provider: always add/consume parking data via `ParkingDataProvider` and `useParkingData()` rather than ad-hoc fetches.
- Caching: use the existing `CACHE_KEY_REALTIME` and `CACHE_KEY_HISTORY` keys to keep UI instant on load.
- Timestamp parsing: code expects API Timestamp fields like `"YYYY-MM-DD HH:MM:SS"` and normalizes with `replace(' ', 'T')` before `new Date(...)`.
- Theme handling: global theme state is controlled by [src/ThemeContext.jsx](src/ThemeContext.jsx#L1-L80) and stored under `parking_theme` in `localStorage`.
- Naming: `Bank_1` is normalized to `Uni Wroc` in the UI (see `Dashboard`), so be careful when matching parking group names.

### Files noteworthy for changes/PRs
- Data & sync: [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx#L1-L400)
- UI entry & routing: [src/main.jsx](src/main.jsx#L1-L20), [src/App.jsx](src/App.jsx#L1-L40)
- Dashboard view: [src/Dashboard.jsx](src/Dashboard.jsx#L1-L300)
- Theme and small utilities: [src/ThemeContext.jsx](src/ThemeContext.jsx#L1-L80)
- Styles: `index.css` and `App.css` are present at repo root `src/` for layout and Tailwind integration (`tailwind.config.js` present).

### Safety, secrets, and TODOs
- `FORM_ENTRIES` contains placeholder Google Form entry IDs and should never be hardcoded with private credentials — prefer environment variables or a secure secret store if real IDs are needed.
- No backend: all network calls are done client-side; adding server-side code changes deployment expectations and CI.
- There are no tests in the repo; add tests to `src/` when creating complex logic (focus on `ParkingDataManager` functions for unit tests).

### When you edit code — quick checklist for PRs
- Run `npm run lint` and `npm run dev` locally to validate UI behavior.
- When changing fetch URLs, preserve the `CORS_PROXY` pattern or explain why it's removed.
- If you change CSV headers or timestamp keys, update `getLastTimestamps()` in `ParkingDataManager`.

### If something's unclear
- Ask for the Google Form entry mapping before modifying `FORM_ENTRIES` or automatic submission paths.
- Confirm whether the deployed static files under `parking-deploy/docs/html/parking/` are authoritative before changing build outputs.

