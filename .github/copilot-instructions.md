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
 
### Migration plan (multi-repo guidance)
- See the repository-level migration roadmap at [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for the full phase-based plan to split this project into `repo-web`, `shared`, and `repo-mobile`.
- When implementing migration tasks, follow these rules:
  - Keep `repo-web`, `shared`, and `repo-mobile` fully separate repositories with independent CI/CD pipelines.
  - Extract only framework-agnostic logic into `shared` (parsing, transforms, reducers); avoid moving React components, Tailwind styles, or DOM-dependent code.
  - Require adapters in `shared` for `storage`, `fetch`, `time`, and `logging` so platform-specific behavior is injected by each consumer repo.
  - Use small, testable commits and update the Iteration Log in `MIGRATION_PLAN.md` for every completed step so work can be paused/resumed without losing context.
  - Preserve existing web CI behavior: after replacing local modules with `shared`, ensure `.github/workflows` still run lint/test/build and GH Pages deploys remain unchanged unless explicitly replaced.
  - Add or update an `.nvmrc` in the root to pin Node for contributors; use Node `22.12.0` for compatibility with current package engines.
  - Do NOT hardcode secrets (Google Form IDs, API keys) in `shared`; use environment variables or per-repo secret stores.

Additions to verify in PRs that touch migration areas:
- `shared` package has no React or DOM imports.
- `repo-web` adapters wrap `localStorage`/`document` only inside the web adapter layer.
- `repo-mobile` adapters use `@react-native-async-storage/async-storage` and fetch without CORS proxies.
- CI workflows in each repo include steps to install `shared` (via npm tag or tarball) and run the same linters/tests as before.

