## MIGRATION_PLAN.md — Web→Mobile Multi-Repo Roadmap

Comprehensive, iterative roadmap to split the current Vite/React web app into three independent repos: `repo-web` (existing web), `shared` (framework-agnostic npm package), and `repo-mobile` (new Expo app). Steps are small, testable, and trackable with checkboxes; progress can pause/resume without losing context.

---

### Phase 1 — Reposition Web Repo & Create Shared Package

1. [x] **Audit current web app** ✅ _Completed 2025-12-29_
   - Map entry and providers: [src/main.jsx](src/main.jsx), [src/App.jsx](src/App.jsx), [src/ThemeContext.jsx](src/ThemeContext.jsx).
   - Core data/logic: [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx), [src/store/parkingStore.js](src/store/parkingStore.js), [src/utils/parkingUtils.js](src/utils/parkingUtils.js), [src/utils/dateUtils.js](src/utils/dateUtils.js), [src/utils/storageUtils.js](src/utils/storageUtils.js).
   - UI dependencies/risk: Tailwind ([src/index.css](src/index.css)), echarts ([src/Dashboard.jsx](src/Dashboard.jsx)).
   - CI/CD: review [.github/workflows/ci.yml](.github/workflows/ci.yml) and other workflows under [.github/workflows](.github/workflows).
   - Output: short Notes entry (deps, tooling, web-only APIs).

2. [ ] **Define shared surface & seams**
   - List modules to extract (pure logic, no React/DOM): parking utils, date utils, capacity maps, approximation logic, store logic (decouple from window/localStorage first).
   - Identify adapters needed (storage, fetch, time, logging) to keep shared package framework-agnostic.
   - Capture browser-only concerns (localStorage, document theme toggles, echarts) in Potential Blockers.

3. [ ] **Extract and harden pure logic**
   - Move selected modules into new `shared` repo structure: `src/` JS, `package.json`, MIT license, lint (ESLint), test (Vitest) mirroring current tests from [test/parkingUtils.test.js](test/parkingUtils.test.js), [test/dateUtils.test.js](test/dateUtils.test.js), [test/parkingStore.test.js](test/parkingStore.test.js).
   - Add minimal build step (tsup/rollup or plain `exports` with "type": "module"), include type definitions if adding JSDoc/TS.
   - Add README with usage and adapter contracts (storage, fetch, time).

4. [ ] **Version and publish shared**
   - Set semantic versioning, pre-release tag (e.g., `0.1.0-alpha.0`).
   - Configure npm scripts: lint, test, build, release dry-run.
   - Optional: GitHub Actions for lint+test+publish on tag.

5. [ ] **Integrate shared into repo-web**
   - Replace local imports with `shared` package; add lightweight web adapters:
     - Storage adapter wrapping localStorage.
     - Fetch adapter preserving CORS proxy pattern from [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx).
     - Theme adapter for document/body class toggles from [src/ThemeContext.jsx](src/ThemeContext.jsx).
   - Remove duplicated logic left in web repo.
   - Update web CI to install published `shared` (or use `npm link`/tarball while unpublished); ensure lint/test/build still pass.

6. [ ] **Stabilize web after split**
   - Run lint/test/build (per [.github/workflows/ci.yml](.github/workflows/ci.yml)).
   - Update docs/README to describe dependency on `shared`.
   - Record iteration outcome and remaining gaps in Iteration Log.

---

### Phase 2 — Mobile App MVP (Expo, separate repo)

1. [ ] **Scaffold repo-mobile**
   - Create Expo app (TypeScript) with ESLint/Prettier and Jest/Expo Testing Library baseline.
   - Add scripts: `expo start`, `expo run:ios`, `expo run:android`, `lint`, `test`.

2. [ ] **Wire shared package**
   - Install `shared` from npm (or git tag), ensure ESM compatibility.
   - Implement platform adapters:
     - Storage via `@react-native-async-storage/async-storage`.
     - Fetch without CORS proxy; handle timeouts/retries.
     - Time utilities (Date works; ensure polyfills if needed).

3. [ ] **Port minimal data flow**
   - Reuse shared fetch/transform logic; build a thin data manager suited for React Native (no document/localStorage).
   - Implement Zustand or React Query store using shared data shapes.

4. [ ] **Build MVP UI slices**
   - Basic availability list view (no echarts) using shared data.
   - Manual refresh and loading/error states.
   - Light/dark theming using React Native Appearance API.

5. [ ] **Device/run validation**
   - Validate on iOS simulator and Android emulator.
   - Capture any platform-specific fetch or TLS issues; log in Potential Blockers.

6. [ ] **Iterate features**
   - Add charts via RN-compatible lib (e.g., `victory-native`/`react-native-svg`).
   - Add offline cache hydration using shared cache shapes.
   - Expand navigation and parity features incrementally; log each iteration.

---

### Best Practices for `shared` Package

- No React/DOM/node-specific APIs; inject adapters for storage, fetch, time, logging.
- Ship ESM (and optionally CJS) with `exports` map; include types (JSDoc or d.ts).
- Tests live with package; keep high coverage on parsing, transforms, store reducers.
- Semantic versioning; changelog per release; use dist-tags for pre-release.
- Automated CI: lint, test, build on PR; publish on tagged main.

---

### Potential Blockers

- Echarts reliance in web UI; needs alternative for mobile.
- CORS proxy baked into web fetch logic; not applicable on mobile.
- Theme handling uses document/body classes; must stay in web adapter only.
- Google Forms submission placeholders (`FORM_ENTRIES`) in [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx) may need secure handling; avoid embedding secrets in shared.

---

### Notes

- Current tooling: React 18, Vite, Tailwind, Zustand, Vitest, ESLint; CI in [.github/workflows](.github/workflows) runs lint/test/build and GH Pages deploy.
- Pure logic candidates: parking utils, date utils, capacity map, approximation logic, store reducers (after removing window/localStorage hooks).

---

### Iteration Log (append entries)

- 2025-12-29 — Phase 1 Step 1 — ✅ Done — **Audit current web app completed** — Full analysis of architecture, dependencies, and migration seams documented below.

---

## Phase 1 Step 1: Audit Results

### Entry Points & Providers
**Entry:** [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx)
- React 18 root rendered to `#root` div
- Conditional StrictMode (disabled in DEV to avoid double-unmount issues)
- Provider hierarchy: ErrorBoundary → ThemeProvider → ParkingDataProvider → (Dashboard|Statistics)

**Theme Management:** [src/ThemeContext.jsx](src/ThemeContext.jsx)
- Uses React Context for light/dark theme state
- **Web-only:** Direct DOM manipulation via `document.body.classList` and localStorage key `parking_theme`
- Must stay in web adapter layer (mobile needs React Native Appearance API)

**Data Management:** [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx)
- Provides `ParkingDataContext` wrapping Zustand store
- Fetches real-time JSON from 2 API endpoints via CORS proxy (`https://corsproxy.io/?`)
- Fetches/parses CSV history from Google Sheets (using PapaParse library)
- Caches to localStorage keys: `parking_realtime_cache`, `parking_history_cache`
- Posts data to Google Forms (placeholder entry IDs in `FORM_ENTRIES`)
- **Web-only concerns:** localStorage, CORS proxy, document APIs

### Core Data/Logic Modules

**Store:** [src/store/parkingStore.js](src/store/parkingStore.js)
- Zustand store managing: realtimeData, historyData, loading/error states, timestamps
- Exports utility functions: `refreshParkingData()`, `clearCache()`
- **Migration target:** Store logic itself is framework-agnostic, but needs adapter injection for storage (currently uses `localStorage` directly)
- Window global `window.clearCache` attached for dev convenience (web-only)

**Parking Utils:** [src/utils/parkingUtils.js](src/utils/parkingUtils.js)
- Pure logic functions: capacity maps, approximation algorithms, data validation, age calculations
- Constants: `PARKING_MAX_CAPACITY`, `APPROXIMATION_THRESHOLD_MINUTES`
- **Fully extractable** to shared package (no DOM/React dependencies)
- Includes reference stability caching for processed data

**Date Utils:** [src/utils/dateUtils.js](src/utils/dateUtils.js)
- Pure timestamp parsing, age calculation, formatting functions
- **Fully extractable** to shared package (plain Date operations)

**Storage Utils:** [src/utils/storageUtils.js](src/utils/storageUtils.js)
- Safe localStorage wrappers with error handling
- **Adapter candidate:** Can be generalized with interface for web (localStorage) vs mobile (AsyncStorage)

### UI Dependencies & Risks

**Tailwind CSS:** [src/index.css](src/index.css)
- Used throughout for styling with custom theme tokens
- **Web-only:** Must remain in repo-web; mobile will use React Native StyleSheet

**echarts:** [src/Dashboard.jsx](src/Dashboard.jsx) and package.json
- Heavy charting library (echarts@6.0.0, echarts-for-react@3.0.5)
- Used for historical data visualization
- **Mobile blocker:** Not compatible with React Native
- **Solution:** Mobile needs alternative (victory-native, react-native-svg, or similar)

**Other dependencies:**
- React 18.2.0, React DOM, React Router DOM (web-specific)
- PapaParse 5.5.3 (CSV parsing - can work in shared/mobile)
- Zustand 5.0.9 (state management - framework-agnostic, can be shared)
- lucide-react 0.562.0 (icons - web-specific, mobile needs react-native-svg equivalent)

### CI/CD Workflows

**ci.yml** - Main CI pipeline
- Triggers: push/PR to main/master branches
- Steps: checkout, Node 20.x setup, npm ci, lint, test with coverage, build
- Artifacts: coverage reports, build artifacts
- **Must preserve** after shared integration

**deploy_vite.yml** - GitHub Pages deployment
- Triggers: push to main, manual workflow_dispatch
- Builds and deploys to external repo (piotereks/piotereks) via peaceiris/actions-gh-pages
- Target: `./parking-deploy/docs/html/parking` → `docs/html/parking`
- Uses DEPLOY_TOKEN secret
- **Must preserve** and ensure build output remains compatible

**build.yml** - Deployment test
- Tests checkout and token configuration
- Custom deployment script via `./cicd/deploy`

### Tooling Summary
- **Build:** Vite 7.2.4 with React plugin
- **Lint:** ESLint 9.39.1 with React plugins
- **Test:** Vitest 4.0.16 with jsdom, Testing Library, coverage via v8
- **CSS:** Tailwind 3.4.0, PostCSS, Autoprefixer
- **Package manager:** npm with Node 20.x (per .nvmrc: 22.12.0 expected)

### Extraction Plan for Shared Package

**Pure logic to extract (no React/DOM):**
1. ✅ [src/utils/parkingUtils.js](src/utils/parkingUtils.js) - capacity maps, approximation, validation, age calcs
2. ✅ [src/utils/dateUtils.js](src/utils/dateUtils.js) - timestamp parsing, formatting
3. ⚠️ [src/store/parkingStore.js](src/store/parkingStore.js) - store reducers/actions (decouple localStorage first)
4. ⚠️ [src/utils/storageUtils.js](src/utils/storageUtils.js) - abstract to storage adapter interface

**Adapters needed for shared:**
- **Storage adapter:** localStorage (web) vs AsyncStorage (mobile)
- **Fetch adapter:** CORS proxy pattern (web only) vs direct fetch (mobile)
- **Time adapter:** Date APIs work everywhere, but may need timezone/locale handling
- **Logging adapter:** console.log vs native logging (optional)

**Must stay in web repo:**
- [src/ThemeContext.jsx](src/ThemeContext.jsx) - document/body manipulation
- [src/Dashboard.jsx](src/Dashboard.jsx) - echarts integration
- [src/index.css](src/index.css) - Tailwind styles
- CORS proxy logic in ParkingDataManager
- Google Forms submission logic (or move to shared with adapter)

### Potential Blockers Identified
1. **echarts dependency:** No direct RN equivalent; mobile needs alternative charting solution
2. **CORS proxy:** Web-specific workaround; mobile fetch should work without it
3. **localStorage usage:** Scattered through code; needs systematic adapter injection
4. **Google Forms submission:** Hardcoded in ParkingDataManager; consider moving to shared with fetch adapter or keeping as web-only feature
5. **Theme management:** Tightly coupled to DOM; must stay in web adapter with RN equivalent for mobile

### Next Steps (Phase 1 Step 2)
Define precise shared surface area:
- Extract parkingUtils, dateUtils as-is
- Refactor parkingStore to accept storage adapter injection
- Design storage/fetch adapter interfaces
- Document adapter contracts in shared package README
