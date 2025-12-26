# 04 — Deployment (web + Expo mobile)

## Web deployment (keep your existing pipeline)

Your web app currently builds with Vite and outputs to a folder under `parking-deploy/...`.

In the monorepo:

- keep the same output folder
- run web build via `npm -w packages/web run build`

If your CI currently runs from repo root, update it to use the workspace script (`npm run build:web`).

---

## Mobile deployment (Expo + EAS)

### What you’ll deploy

- Android: EAS build produces an `.aab` (Play Store) or `.apk` (internal testing)
- iOS: EAS build produces an archive for TestFlight/App Store (requires Apple Dev account)

### Setup

From `packages/mobile`:

```bash
npm install
npx expo login
npx eas build:configure
```

Then build:

```bash
npx eas build -p android
npx eas build -p ios
```

### Updates

- For JS-only updates: `eas update` (OTA updates)
- For native dependency changes: new EAS build required

---

## Expo Web / RN Web

Out of scope for this migration decision.

---

## What to share for deployments

- Shared package should avoid platform-specific dependencies.
- If you need platform-specific files, use suffixes:
  - `*.web.js` for web implementations
  - `*.native.js` for RN implementations

This pattern works well for storage adapters.
