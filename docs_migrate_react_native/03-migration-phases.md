# 03 — Migration phases + sequence steps (repo-specific)

## Phase 0 — Decide scope (1–2 hours)

Make these decisions up front:

- Keep current web deploy working throughout? **Yes** (recommended)
- Is Expo Web required, or optional? **Optional** (recommended)
- Share UI now? **No** (recommended)

Definition of done for Phase 0:

- You agree on monorepo layout and first shared modules.

---

## Phase 1 — Monorepo skeleton (0.5–1 day)

Objective: create `packages/web`, `packages/mobile`, `packages/shared` and get *both apps running locally*.

Checklist:

- [ ] Move current Vite app to `packages/web` and run `npm run dev:web`
- [ ] Create Expo app in `packages/mobile` and run it in Expo Go
- [ ] Add `packages/shared` and import a trivial constant from it in both apps

Stop condition: you can develop web + mobile side-by-side.

---

## Phase 2 — Share utilities + store (0.5–1 day)

Objective: share pure code with no DOM.

Move to `packages/shared` first:

- `src/utils/dateUtils.js`
- `src/utils/parkingUtils.js`
- `src/store/parkingStore.js` (or keep store per app but share selectors/constants)

Notes for your repo:

- `parkingUtils.calculateDataAge()` assumes timestamp strings like `"YYYY-MM-DD HH:MM:SS"`; this can remain shared.

Stop condition:

- Web still works
- Mobile can render a basic screen that reads the shared store and shows placeholder UI.

---

## Phase 3 — Share data-fetching core (1–2 days)

Objective: extract the non-UI parts of `src/ParkingDataManager.jsx` into a shared core that works on both platforms.

Your current `ParkingDataManager.jsx` contains:

- cache keys: `parking_realtime_cache`, `parking_history_cache`
- history reconciliation between API timestamps and cached CSV history
- auto-refresh via `setInterval`
- web-only cache storage via `localStorage`
- web-only CORS proxy usage

Approach:

1) Create a shared “core” module that takes adapters:
   - `storage` (web: localStorage wrapper, mobile: AsyncStorage)
   - `fetch` (both can use global `fetch`)
   - `corsProxyUrl` (web uses it, mobile sets undefined)

2) In each app, keep a small provider/hook that:
   - calls core functions
   - writes results into Zustand store

Stop condition:

- Web dashboard works (same behavior)
- Mobile app can fetch and display realtime values with a simple RN UI

---

## Phase 4 — Replace web-only UI concepts in mobile (1–3 days)

### Theme

Your current theme logic (`ThemeContext`) does:

- reads `localStorage`
- toggles `document.body.classList`

Mobile equivalent:

- store theme preference in AsyncStorage
- apply theme via RN styles (no `document.body`)

Recommendation:

- move theme preference logic into shared (storage + boolean)
- keep actual style application platform-specific

### Statistics chart

Your current `Statistics.jsx` uses:

- `echarts-for-react`
- `window.innerWidth`

RN plan:

- choose a RN charting library (e.g. Victory Native or `react-native-svg` based solutions)
- keep the **data shaping** in shared (turn rows -> series points)
- implement chart rendering separately

Stop condition:

- Mobile has a usable dashboard and a basic history view (even if charting is simplified).

---

## Phase 5 — Optional: Shared UI via React Native Web (bigger step)

Only do this if you want one UI codebase.

Tradeoffs:

- you’d likely replace Tailwind/CSS with RN styling (or adopt `nativewind`)
- you’d need web + native compatible charting

Alternative:

- keep web UI as-is
- share logic only

---

## Phase 6 — Hardening + platform concerns

- Background refresh (mobile)
- Offline-first behavior (mobile)
- Error handling + user messaging parity
- Analytics/monitoring

