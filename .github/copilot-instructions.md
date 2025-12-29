## Copilot Guide (fresh)

### Purpose
Give Copilot the minimal context to work safely and productively in this React/Vite parking availability app, and to follow the ongoing migration toward `repo-web`, `shared`, and `repo-mobile`.

### Quick start
- Install Node 22.12.0 (see `.nvmrc`).
- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

### Architecture snapshot
- Entry: `src/main.jsx` -> `src/App.jsx`; theme via `src/ThemeContext.jsx`.
- Data layer: `src/ParkingDataManager.jsx` fetches real-time (API_URLS with CORS proxy), parses CSV history (PapaParse), caches to localStorage keys `parking_realtime_cache` and `parking_history_cache`, and can POST to Google Forms (FORM_ENTRIES are placeholders).
- State: `src/store/parkingStore.js` (Zustand); utilities in `src/utils/parkingUtils.js`, `dateUtils.js`, `storageUtils.js`.
- UI: `src/Dashboard.jsx` (real-time + echarts), `src/Statistics.jsx` (historical), styles in `src/index.css` and `src/App.css`.
- Tests: Vitest + Testing Library under `test/` (jsdom).

### Conventions
- Use `ParkingDataProvider`/`useParkingData()` instead of ad-hoc fetches.
- Keep CORS proxy usage when adding external fetches.
- Normalize timestamps with `replace(' ', 'T')` before `new Date(...)`.
- Theme state stored in localStorage key `parking_theme`; body class toggles live in ThemeContext.
- Do not hardcode Google Form IDs or secrets; `FORM_ENTRIES` are placeholders.

### Migration guidance
- Roadmap lives in `MIGRATION_PLAN.md`; update the Iteration Log when completing steps.
- Goal: separate repos: `repo-web` (current app), `shared` (plain JS, no React/DOM), `repo-mobile` (Expo RN).
- Extract only framework-agnostic logic into `shared`; require adapters for storage, fetch, time, logging.
- Web adapters own `localStorage`/`document` usage; mobile adapters own AsyncStorage/fetch without CORS proxy.
- Preserve web CI (lint/test/build, GH Pages) when adopting `shared`.

### Safety and PR checklist
- Run lint/tests before PRs (`npm run lint`, `npm test` if added).
- If changing fetch URLs or CSV headers, adjust `ParkingDataManager` helpers (e.g., `getLastTimestamps`).
- Avoid DOM-only libs in shared/mobile paths; echarts is web-only.
- Keep credentials out of source; prefer env or secrets.

### If unclear
- Confirm Google Form entry mapping before submission changes.
- Check whether `parking-deploy/docs/html/parking/` artifacts are authoritative before modifying build outputs.

