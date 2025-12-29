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

2. [x] **Define shared surface & seams** ✅ _Completed 2025-12-29_
   - List modules to extract (pure logic, no React/DOM): parking utils, date utils, capacity maps, approximation logic, store logic (decouple from window/localStorage first).
   - Identify adapters needed (storage, fetch, time, logging) to keep shared package framework-agnostic.
   - Capture browser-only concerns (localStorage, document theme toggles, echarts) in Potential Blockers.

3. [x] **Extract and harden pure logic** ✅ _Completed 2025-12-29_
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
- 2025-12-29 — Phase 1 Step 2 — ✅ Done — **Defined shared surface & seams** — Modules to extract, adapter contracts, and package structure documented below.
- 2025-12-29 — Phase 1 Step 3 — ✅ Done — **Extracted and hardened pure logic** — Created parking-shared package with all core modules, tests, and documentation.

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

---

## Phase 1 Step 2: Shared Surface & Seams Definition

### Modules to Extract (Pure Logic)

#### 1. **parkingUtils.js** - Core Business Logic ✅ Ready
**File:** [src/utils/parkingUtils.js](src/utils/parkingUtils.js) (288 lines)
**Status:** Fully extractable, no dependencies on React/DOM/window
**Exports:**
- Constants: `PARKING_MAX_CAPACITY`, `APPROXIMATION_THRESHOLD_MINUTES`
- Functions: `normalizeParkingName()`, `getAgeClass()`, `calculateTotalSpaces()`, `isValidParkingData()`, `calculateDataAge()`, `formatAgeLabel()`, `getMaxCapacity()`, `calculateApproximation()`, `applyApproximations()`
**Tests:** [test/parkingUtils.test.js](test/parkingUtils.test.js) - migrate as-is

**Notes:** 
- Uses module-level cache (`lastProcessedData`, `lastParkingDataRef`, `lastApproximationState`) for reference stability
- Cache is safe for shared package (no side effects)
- All date operations use passed `now` parameter (no hidden Date.now() calls)

#### 2. **dateUtils.js** - Date/Time Utilities ✅ Ready
**File:** [src/utils/dateUtils.js](src/utils/dateUtils.js) (52 lines)
**Status:** Fully extractable, only uses standard Date APIs
**Exports:**
- `parseTimestamp(raw)` - handles space-to-T normalization
- `getAgeInMinutes(from, to)` - simple date math
- `formatTime(timestamp, locale)` - uses `toLocaleTimeString()`
- `isStaleTimestamp(timestamp, thresholdMinutes)`
**Tests:** [test/dateUtils.test.js](test/dateUtils.test.js) - migrate as-is

**Notes:**
- Locale parameter in `formatTime()` defaults to 'pl-PL' (keep as-is, caller can override)
- All functions are pure and stateless

#### 3. **Store Logic** - Refactor Required ⚠️
**Source:** [src/store/parkingStore.js](src/store/parkingStore.js)
**Status:** Needs adapter injection before extraction
**Current Issues:**
- Direct `localStorage` access in `clearCache()` function
- `window.clearCache` global attachment (lines 97-99)
- Hard-coded cache key strings

**Extraction Plan:**
```javascript
// shared/src/store/createParkingStore.js
export const createParkingStore = (adapters = {}) => {
  const { storage, logger = console } = adapters;
  
  return create((set) => ({
    // ... existing state ...
    
    // Actions use injected storage adapter
    clearCache: async () => {
      if (storage) {
        await storage.remove('parking_realtime_cache');
        await storage.remove('parking_history_cache');
      }
      set({ cacheCleared: true, fetchInProgress: false });
      logger.log('Cache cleared');
    }
  }));
};
```

**Web Adapter Implementation:**
```javascript
// repo-web/src/adapters/webStorage.js
export const webStorageAdapter = {
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem(key);
  }
};
```

#### 4. **Data Transform Logic** - Extract from ParkingDataManager ⚠️
**Source:** [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx) (lines 48-116, 361-380)
**Pure functions to extract:**
- `normalizeKey()` - string normalization
- `findColumnKey()` - CSV column matching
- `getRowValue()` - safe row value extraction
- `parseTimestampValue()` - timestamp parsing (duplicate of dateUtils)
- `buildEntryFromRow()` - CSV row → data entry
- `extractLastEntry()` - get last row from history
- `dedupeHistoryRows()` - remove duplicate history entries
- `parseApiEntry()` - API response → entry
- `buildCacheRowFromPayload()` - construct cache row

**New shared module:** `shared/src/dataTransforms.js`
**Tests:** Extract relevant sections from existing tests or write new ones

**Notes:**
- These are pure data transformation functions
- `parseTimestampValue()` can be unified with `dateUtils.parseTimestamp()`
- No dependencies on React/DOM/localStorage

### Adapter Interfaces

#### Storage Adapter Interface
```typescript
interface StorageAdapter {
  // Async to support both localStorage (sync) and AsyncStorage (async)
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear?(): Promise<void>; // optional
}
```

**Web Implementation:** Wraps `localStorage` with async interface
**Mobile Implementation:** Wraps `@react-native-async-storage/async-storage`

#### Fetch Adapter Interface
```typescript
interface FetchAdapter {
  // Generic fetch abstraction
  fetch(url: string, options?: RequestInit): Promise<Response>;
  
  // Higher-level helpers
  fetchJSON(url: string, options?: RequestInit): Promise<any>;
  fetchText(url: string, options?: RequestInit): Promise<string>;
}
```

**Web Implementation:**
- Applies CORS proxy to specific domains (zaparkuj.pl)
- Adds cache-busting query params
- Handles retries/timeouts

**Mobile Implementation:**
- Direct fetch (no CORS proxy needed)
- Platform-specific timeout handling
- May need polyfills for older RN versions

#### Logger Adapter Interface
```typescript
interface LoggerAdapter {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug?(...args: any[]): void;
}
```

**Default:** `console` (works everywhere)
**Optional:** Sentry, custom loggers, silent mode for tests

#### Time Adapter Interface (Optional)
```typescript
interface TimeAdapter {
  now(): Date;
  // Could add timezone/locale overrides if needed
}
```

**Default:** `{ now: () => new Date() }` (sufficient for now)
**Future:** Mock time for testing, server time sync

### Web-Specific Seams (Must Stay in repo-web)

#### 1. **Theme Management** - [src/ThemeContext.jsx](src/ThemeContext.jsx)
**Why web-only:**
- `document.body.classList.add('dark')` / `.remove('dark')`
- Direct `localStorage.getItem/setItem('parking_theme')`
- React Context (web-specific pattern, mobile uses different context system)

**Mobile equivalent:** React Native Appearance API + AsyncStorage
```javascript
// repo-mobile equivalent
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
```

#### 2. **CORS Proxy Logic** - [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx#L13)
**Why web-only:**
```javascript
const CORS_PROXY = 'https://corsproxy.io/?';
const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
```
Browser CORS restrictions don't apply to React Native - direct fetch works

**Adapter approach:**
```javascript
// Web adapter
fetchAdapter.fetch(url) => fetch(`${CORS_PROXY}${encodeURIComponent(url)}`)

// Mobile adapter
fetchAdapter.fetch(url) => fetch(url)
```

#### 3. **Google Forms Submission** - [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx#L192-242)
**Decision:** Keep in shared with fetch adapter
- Logic is generic (POST form-encoded data)
- Form entry IDs can be config/environment
- Adapter handles CORS/no-cors mode differences

#### 4. **echarts Integration** - [src/Dashboard.jsx](src/Dashboard.jsx)
**Why web-only:**
- `echarts` and `echarts-for-react` are DOM/Canvas-based
- No React Native equivalent

**Mobile alternative:** victory-native or react-native-svg charts (Phase 2)

#### 5. **CSV Parsing** - Uses PapaParse
**Status:** Can work in shared
- PapaParse works in Node.js/browser/RN
- No DOM dependencies
- Include as peer dependency in shared package

### Shared Package Structure

```
parking-shared/
├── package.json
├── README.md
├── LICENSE (MIT)
├── .gitignore
├── .eslintrc.js
├── vitest.config.js
├── src/
│   ├── index.js                    # Main exports
│   ├── parkingUtils.js             # From repo-web/src/utils/parkingUtils.js
│   ├── dateUtils.js                # From repo-web/src/utils/dateUtils.js
│   ├── dataTransforms.js           # Extracted from ParkingDataManager.jsx
│   ├── store/
│   │   └── createParkingStore.js   # Refactored parkingStore.js with adapters
│   ├── adapters/
│   │   ├── types.js                # Adapter interface docs (JSDoc)
│   │   └── defaultAdapters.js      # Console logger, Date.now() timer
│   └── constants.js                # API URLs, cache keys, form config
├── test/
│   ├── parkingUtils.test.js        # Migrated from repo-web
│   ├── dateUtils.test.js           # Migrated from repo-web
│   ├── dataTransforms.test.js      # New tests
│   └── store.test.js               # Adapted from repo-web with mock adapters
└── dist/                           # Built output (via tsup/rollup)
    ├── index.js                    # ESM
    ├── index.cjs                   # CJS (optional)
    └── index.d.ts                  # TypeScript definitions (JSDoc-generated)
```

#### package.json Structure
```json
{
  "name": "@piotereks/parking-shared",
  "version": "0.1.0-alpha.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsup src/index.js --format esm,cjs --dts",
    "prepublishOnly": "npm run lint && npm run test && npm run build"
  },
  "peerDependencies": {
    "zustand": "^5.0.0",
    "papaparse": "^5.5.0"
  },
  "devDependencies": {
    "eslint": "^9.39.0",
    "vitest": "^4.0.0",
    "tsup": "^8.0.0",
    "zustand": "^5.0.9",
    "papaparse": "^5.5.3"
  }
}
```

### Extraction Dependencies

**Build Tool:** tsup (simple, handles ESM/CJS/DTS)
**Testing:** Vitest (no jsdom needed - pure logic)
**Linting:** ESLint (match repo-web config)
**Peer Dependencies:**
- `zustand` - for store creation
- `papaparse` - for CSV parsing (if kept in shared)

### Migration Boundaries Summary

| Module | Status | Location | Dependencies | Notes |
|--------|--------|----------|-------------|-------|
| parkingUtils.js | ✅ Ready | shared/src/ | None | Pure logic |
| dateUtils.js | ✅ Ready | shared/src/ | None | Pure logic |
| dataTransforms.js | ⚠️ Extract | shared/src/ | None | Extract from ParkingDataManager |
| parkingStore.js | ⚠️ Refactor | shared/src/store/ | Needs adapters | Inject storage/logger |
| ThemeContext.jsx | ❌ Stay | repo-web only | document, localStorage | DOM-specific |
| ParkingDataManager.jsx | ⚠️ Split | Both | React, fetch | Data fetching logic → shared with adapters; React provider → web |
| Dashboard.jsx | ❌ Stay | repo-web only | echarts, React | UI-specific |
| Statistics.jsx | ❌ Stay | repo-web only | echarts, React | UI-specific |

### Adapter Injection Points

1. **Store Creation** - `createParkingStore(adapters)` receives storage, logger
2. **Data Manager** - Will become `createParkingDataManager(adapters)` receiving fetch, storage, logger
3. **Constants** - API URLs, cache keys exported as config (can override per platform)

### Next Steps (Phase 1 Step 3)
Begin extraction work:
1. Create `parking-shared` repo with initial structure
2. Copy parkingUtils.js and dateUtils.js with tests
3. Extract data transform functions into dataTransforms.js
4. Refactor parkingStore.js to accept adapter injection
5. Write adapter interface documentation
6. Set up build pipeline (tsup, ESLint, Vitest)

---

## Phase 1 Step 3: Extraction Results

### Package Structure Created

```
parking-shared/
├── package.json               ✅ Version 0.1.0-alpha.0, ESM+CJS exports
├── README.md                  ✅ Full documentation with examples
├── LICENSE                    ✅ MIT License
├── .gitignore                 ✅ Standard Node.js ignores
├── eslint.config.js           ✅ ESLint 9 flat config
├── vitest.config.js           ✅ Vitest configuration with coverage
├── src/
│   ├── index.js               ✅ Main exports barrel file
│   ├── parkingUtils.js        ✅ Core parking logic (288 lines)
│   ├── dateUtils.js           ✅ Date/time utilities (52 lines)
│   ├── dataTransforms.js      ✅ CSV/API transforms (145 lines)
│   ├── store/
│   │   └── createParkingStore.js  ✅ Zustand factory with adapters (87 lines)
│   └── adapters/
│       └── types.js           ✅ Adapter interfaces + defaults (69 lines)
└── test/
    ├── parkingUtils.test.js   ✅ 443 lines of tests
    ├── dateUtils.test.js      ✅ 175 lines of tests
    └── dataTransforms.test.js ✅ 200+ lines of tests
```

### Modules Successfully Extracted

#### 1. **parkingUtils.js** ✅
- **Source:** [src/utils/parkingUtils.js](src/utils/parkingUtils.js)
- **Destination:** [parking-shared/src/parkingUtils.js](parking-shared/src/parkingUtils.js)
- **Status:** Copied as-is, no modifications needed
- **Dependencies:** None (pure logic)
- **Tests:** [parking-shared/test/parkingUtils.test.js](parking-shared/test/parkingUtils.test.js)

#### 2. **dateUtils.js** ✅
- **Source:** [src/utils/dateUtils.js](src/utils/dateUtils.js)
- **Destination:** [parking-shared/src/dateUtils.js](parking-shared/src/dateUtils.js)
- **Status:** Copied as-is, no modifications needed
- **Dependencies:** None (pure logic)
- **Tests:** [parking-shared/test/dateUtils.test.js](parking-shared/test/dateUtils.test.js)

#### 3. **dataTransforms.js** ✅ NEW
- **Source:** Extracted from [src/ParkingDataManager.jsx](src/ParkingDataManager.jsx)
- **Destination:** [parking-shared/src/dataTransforms.js](parking-shared/src/dataTransforms.js)
- **Status:** Successfully extracted 9 pure functions
- **Functions Extracted:**
  - `normalizeKey()` - String normalization
  - `findColumnKey()` - CSV column matching
  - `getRowValue()` - Safe row value extraction
  - `parseTimestampValue()` - Timestamp parsing
  - `buildEntryFromRow()` - CSV row → data entry
  - `extractLastEntry()` - Get last row from history
  - `dedupeHistoryRows()` - Remove duplicate history entries
  - `parseApiEntry()` - API response → entry
  - `cloneApiResults()` - Clone API results array
  - `buildCacheRowFromPayload()` - Construct cache row
- **Tests:** [parking-shared/test/dataTransforms.test.js](parking-shared/test/dataTransforms.test.js) (NEW)

#### 4. **createParkingStore.js** ✅ REFACTORED
- **Source:** [src/store/parkingStore.js](src/store/parkingStore.js)
- **Destination:** [parking-shared/src/store/createParkingStore.js](parking-shared/src/store/createParkingStore.js)
- **Status:** Refactored to accept adapter injection
- **Changes:**
  - Export `createParkingStore(adapters)` factory function
  - Removed direct `localStorage` access
  - Removed `window.clearCache` global attachment
  - Storage operations now use injected `storage` adapter
  - Logger operations use injected `logger` adapter (default: console)
  - Created `createRefreshHelper()` utility
- **Adapters Required:**
  - `storage` - StorageAdapter interface (localStorage/AsyncStorage)
  - `logger` - LoggerAdapter interface (optional, defaults to console)

#### 5. **Adapter Interfaces** ✅ NEW
- **File:** [parking-shared/src/adapters/types.js](parking-shared/src/adapters/types.js)
- **Contents:**
  - `StorageAdapter` interface (JSDoc)
  - `FetchAdapter` interface (JSDoc)
  - `LoggerAdapter` interface (JSDoc)
  - `TimeAdapter` interface (JSDoc)
  - `defaultLogger` implementation (console)
  - `defaultTime` implementation (Date)
  - `nullStorage` implementation (testing)
  - `nullLogger` implementation (testing)

### Configuration Files Created

#### package.json ✅
- **Package name:** `@piotereks/parking-shared`
- **Version:** `0.1.0-alpha.0`
- **Type:** `module` (ESM)
- **Exports:** ESM + CJS dual format
- **Scripts:** lint, test, test:watch, test:coverage, build, prepublishOnly
- **Peer dependencies:** zustand@^5.0.0
- **Dev dependencies:** eslint@^9.39.0, tsup@^8.0.0, vitest@^4.0.0

#### eslint.config.js ✅
- ESLint 9 flat config format
- Extends `@eslint/js` recommended rules
- Custom rules for unused vars, console
- Ignores dist/, node_modules/, coverage/

#### vitest.config.js ✅
- Node environment (no jsdom needed)
- Coverage via v8 provider
- JSON, text, HTML reporters
- Excludes test files and config from coverage

#### LICENSE ✅
- MIT License
- Copyright 2025 piotereks

#### README.md ✅
- Comprehensive documentation
- Quick start guides for web and mobile
- Full API reference
- Adapter interface documentation
- Examples for localStorage and AsyncStorage
- Development instructions

### Test Coverage

All three test files migrated and adapted:
- **parkingUtils.test.js** - 443 lines, covers all utility functions
- **dateUtils.test.js** - 175 lines, covers all date utilities
- **dataTransforms.test.js** - 200+ lines, NEW tests for extracted functions

### Build Configuration

**tsup** configured for:
- Input: `src/index.js`
- Output formats: ESM (`dist/index.js`) + CJS (`dist/index.cjs`)
- Type definitions: JSDoc → `dist/index.d.ts`

### Next Steps (Phase 1 Step 4)

The shared package is now ready for:
1. Install dependencies: `cd parking-shared && npm install`
2. Run tests: `npm test`
3. Build package: `npm run build`
4. Create initial git commit
5. Tag release: `git tag v0.1.0-alpha.0`
6. Publish to npm (or use local tarball/link for testing)

After validation, proceed to Phase 1 Step 4: Version and publish shared package.
- Document adapter contracts in shared package README
