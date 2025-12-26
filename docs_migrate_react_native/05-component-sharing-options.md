# 05 — Component sharing options (what’s realistic)

You asked for a monorepo where you can keep deploying the current React web app, and also deploy a React Native app (Android/iOS, optionally web).

This document explains **what can be shared** and **when it becomes worth it**.

---

## Option A (recommended): Share logic only, keep separate UIs

### You keep

- Web UI: React DOM + Vite + Tailwind + ECharts
- Mobile UI: React Native components + Expo

### You share

- Zustand store + selectors
- Data fetching + parsing + cache model
- Utilities (date parsing, normalization, approximations)

### Pros

- Lowest risk and fastest path
- Keeps your current web deployment unchanged
- Lets mobile iterate without breaking web

### Cons

- You write UI twice (web + mobile)

---

## Option B: Share UI via React Native Web (single UI codebase)

### What it means

- You write UI using React Native primitives (View/Text/Pressable)
- Web runs via `react-native-web`

### Pros

- One UI codebase for iOS/Android/Web

### Cons (important for your repo)

- Your current web app uses Tailwind/CSS and DOM-centric patterns
- Your charting uses ECharts, which is web-only
- You will likely refactor most UI anyway

### When to consider

- After Phase 3/4 (shared core + mobile stable)
- Only if UI sharing is a clear productivity win

---

## Option C: Share a subset of UI (design tokens + “headless” components)

Middle ground:

- Share non-visual components (formatters, derived state, text strings)
- Keep view layer per platform

This often yields ~70% of the benefit with low pain.

---

## Practical recommendation for *this* repo

- Start with **Option A**.
- After mobile is working, re-evaluate whether you want to:
  - keep the web UI as-is permanently, or
  - migrate the web UI to RN Web.
