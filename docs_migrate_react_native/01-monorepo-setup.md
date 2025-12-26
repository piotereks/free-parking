# 01 — Monorepo setup (keep web deploy, add Expo mobile)

## Goal

Create a monorepo that:

- preserves the existing **Vite web app** deployment (no rewrite required)
- adds an **Expo** app for Android/iOS (and optionally Expo Web)
- enables sharing logic through a `shared` package

This guide assumes **npm workspaces**.

---

## Target directory structure

```
free-parking/
  packages/
    web/                # your existing Vite app (moved here)
    mobile/             # new Expo app
    shared/             # shared business logic (no platform UI)
  docs_migrate_react_native/
  package.json          # root workspace config
  ...
```

### Why not “one app for everything” immediately?

Your current web UI uses:

- DOM (`window`, `document`) in places (e.g. theme toggling, responsive checks)
- CSS/Tailwind
- `echarts-for-react`

Those don’t port 1:1 to React Native. The lowest-risk path is:

1) keep the web app deployable
2) build the mobile app
3) share business logic
4) decide later if sharing UI is worth it

---

## Step-by-step

### Step 0 — Create `packages/`

- Create `packages/web`, `packages/mobile`, `packages/shared`.

### Step 1 — Move the existing web app into `packages/web`

Move these into `packages/web/`:

- `src/`, `public/`, `index.html`
- `vite.config.js`, `vite.config.local.js`, `tailwind.config.js`, `postcss.config.js`
- `eslint.config.*`, `vitest.config.js`
- (optionally) keep deployment docs at repo root

Then adjust paths inside `packages/web/vite.config.js` if it uses relative `outDir`.

> If you want the web build output to keep landing in the same place (your `parking-deploy/...` folder), keep that path stable or compute it relative to repo root.

### Step 2 — Add a root `package.json` with workspaces

Root `package.json` (example):

```json
{
  "name": "free-parking",
  "private": true,
  "workspaces": [
    "packages/web",
    "packages/mobile",
    "packages/shared"
  ],
  "scripts": {
    "dev:web": "npm -w packages/web run dev",
    "build:web": "npm -w packages/web run build",
    "lint:web": "npm -w packages/web run lint",

    "dev:mobile": "npm -w packages/mobile run start",

    "test:web": "npm -w packages/web run test",

    "lint": "npm run lint:web"
  }
}
```

Keep `packages/web/package.json` very similar to your current one.

### Step 3 — Create the Expo app in `packages/mobile`

From repo root:

```bash
npx create-expo-app@latest packages/mobile
```

Recommended (managed) setup items:

```bash
cd packages/mobile
npx expo install react-native-screens react-native-safe-area-context
```

If you want navigation:

```bash
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
```

> You can add stack/tabs later; don’t block Phase 1 on navigation.

### Step 4 — Create `packages/shared`

Start with plain JS to reduce friction (you can migrate to TS later):

```
packages/shared/
  package.json
  src/
```

`packages/shared/package.json` (example):

```json
{
  "name": "@free-parking/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.js"
}
```

### Step 5 — Wire shared package into web + mobile

In `packages/web/package.json` and `packages/mobile/package.json` add:

```json
"dependencies": {
  "@free-parking/shared": "*"
}
```

With npm workspaces, `"*"` resolves to the workspace package.

---

## Running locally

From repo root:

- Web: `npm run dev:web`
- Mobile: `npm run dev:mobile`

---

## Notes specific to this repo

- Your web build currently targets `parking-deploy/docs/html/parking/` via Vite config. When moved into `packages/web/`, you’ll want to keep output pointing to the same location (likely using `path.resolve(__dirname, '../../parking-deploy/...')`).
- Your web app uses ECharts (`echarts-for-react`), which is web-only; plan a different chart library for RN.
