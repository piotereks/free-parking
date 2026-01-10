# mobile/ — Adapter Architecture

This document describes the adapter contracts and usage for the Expo mobile app. Mobile integrates with `parking-shared` by providing platform-specific adapters for storage, fetch, and logging.

## Adapter Overview

- **Storage Adapter**: async key/value store (wraps `@react-native-async-storage/async-storage`). Methods:
  - `get(key): Promise<any | null>` — returns parsed JSON or null
  - `set(key, value): Promise<void>` — stores JSON-stringified value
  - `remove(key): Promise<void>`
  - `clear(): Promise<void>` (optional)

- **Fetch Adapter**: thin wrapper around global `fetch`. Methods:
  - `fetch(url, options): Promise<Response>`
  - `fetchJSON(url, options): Promise<any>`
  - `fetchText(url, options): Promise<string>`

- **Logger Adapter** (optional): object with `log`, `warn`, `error` methods. Default: `console`.

## Cache keys

- `parking_realtime_cache`
- `parking_history_cache`

Keep these keys consistent with the web (`web/src/ParkingDataManager.jsx`) and `shared` package tests.

## Usage example

Create adapters and pass them into the shared store factory:

```javascript
import { createParkingStore } from 'parking-shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createMobileStorageAdapter = () => ({
  get: async (k) => {
    const v = await AsyncStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  },
  set: async (k, value) => AsyncStorage.setItem(k, JSON.stringify(value)),
  remove: async (k) => AsyncStorage.removeItem(k),
  clear: async () => AsyncStorage.clear(),
});

const createMobileFetchAdapter = () => ({
  fetch: async (url, opts = {}) => {
    const finalUrl = url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    return fetch(finalUrl, opts);
  },
  fetchJSON: async (url, opts) => (await (await this.fetch(url, opts)).json()),
  fetchText: async (url, opts) => (await (await this.fetch(url, opts)).text()),
});

const adapters = {
  storage: createMobileStorageAdapter(),
  fetch: createMobileFetchAdapter(),
  logger: console,
};

export const useParkingStore = createParkingStore(adapters);
```

## Quick start (mobile)

```bash
cd mobile
npm install
npm run lint
npm test
npm run start -- --offline
```

## Notes

- Mobile fetch adapter intentionally avoids any CORS proxy (not required in RN).
- Keep cache key names identical to web/shared to allow parity across platforms.
- Prefer injecting adapters at app bootstrap (singleton) and reusing the returned store hook across the app.
