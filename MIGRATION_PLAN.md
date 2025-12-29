## MIGRATION_PLAN.md — Web→Mobile Multi-Repo Roadmap

Comprehensive, iterative roadmap to split the current Vite/React web app into three independent repos: `repo-web` (existing web), `shared` (framework-agnostic npm package), and `repo-mobile` (new Expo app). Steps are small, testable, and trackable with checkboxes; progress can pause/resume without losing context.

---

### Phase 1 — Reposition Web Repo & Create Shared Package

1. [ ] **Audit current web app**
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

- YYYY-MM-DD — Phase X Step N — Done/Pending — Summary/links — Owner
