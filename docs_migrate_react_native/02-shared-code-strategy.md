# 02 — Shared code strategy (what to share, what not to share)

## What you can share immediately (recommended)

Share **business logic**, not UI:

- Data fetching + parsing + caching logic currently in `src/ParkingDataManager.jsx`
- Zustand store definition in `src/store/parkingStore.js`
- Utilities in `src/utils/*` (`dateUtils`, `parkingUtils`)
- Constants / normalization rules (e.g. `Bank_1` -> `Uni Wroc`)

This yields maximum reuse with minimal platform pain.

---

## What you should *not* share initially

- DOM-dependent code (`window`, `document`, `localStorage`)
- CSS/Tailwind styles
- ECharts (`echarts-for-react`) usage

These are platform-specific.

---

## Key adapters you’ll need (platform boundary)

Your current code uses `localStorage`, `window`, and DOM concepts. In a shared package, replace them with explicit adapters.

### 1) Storage adapter

**Web**: `localStorage`

**React Native**: `@react-native-async-storage/async-storage`

Create a shared interface:

```ts
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

- Web implementation wraps `localStorage` and returns Promises.
- Mobile implementation wraps `AsyncStorage`.

Why: your current cache keys (`parking_realtime_cache`, `parking_history_cache`) should remain stable, but the storage backend changes.

### 2) Network adapter (CORS proxy)

Your web app uses `CORS_PROXY` to bypass CORS.

- On native mobile you generally **don’t need** a CORS proxy.

So, in shared fetching code:

- accept a `corsProxyUrl?: string` option
- web passes the proxy
- mobile passes `undefined`

### 3) Time + scheduling

You currently use `setInterval` for auto-refresh.

- This works on RN too, but background behavior differs.
- In Phase 1, keep it simple (refresh only while app is in foreground). Later you can add background fetch if needed.

### 4) Environment/config

Move URLs/config into a shared config object:

- API URLs
- CSV URL
- cache keys

Then provide overrides per platform.

---

## Suggested shared package layout

```
packages/shared/src/
  index.js
  config/
    defaults.js
  parking/
    parkingStore.js
    parkingDataManagerCore.js
    historyCsv.js
  adapters/
    storage.web.js
    storage.native.js
    fetchConfig.js
  utils/
    dateUtils.js
    parkingUtils.js
```

### “Core” vs “UI provider” split

Today `ParkingDataProvider` is a React provider that also contains the fetch/caching logic.

For sharing:

- Extract a **platform-agnostic core** module:
  - `loadRealtimeFromCache()`
  - `fetchRealtime()`
  - `loadHistoryFromCache()`
  - `fetchHistoryCsv()`
  - `checkAndUpdateHistory()`
- Keep the React-specific provider in each app:
  - Web provider calls the shared core
  - Mobile provider calls the shared core

That keeps RN and web wiring simple.

---

## Sharing UI components (optional, later)

If you want to share UI, you have two realistic options:

1) **Keep current web UI** and do *not* share UI.
   - Fastest, lowest risk.

2) Build a React Native UI and run it on web via `react-native-web`.
   - Higher effort.
   - Would likely replace your existing Tailwind/CSS approach.
   - You’d need chart strategy changes (web + RN chart parity).

Recommendation: **do option 1 first**, revisit option 2 only if you have a strong reason (shared UI velocity, single design system, etc.).
