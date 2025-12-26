# 06 — First-week execution checklist (minimal ambiguity)

This is the shortest path to a working monorepo + Expo app while keeping web deploy stable.

## Day 1 — Monorepo skeleton

- [ ] Create `packages/web`, `packages/mobile`, `packages/shared`
- [ ] Move current web app into `packages/web` and make it run:
  - `npm -w packages/web run dev`
- [ ] Add root workspaces `package.json` and confirm:
  - `npm run dev:web` works
- [ ] Create Expo app in `packages/mobile` and confirm:
  - `npm run dev:mobile` launches Expo

Deliverable: both apps run locally.

## Day 2 — Shared package “hello world”

- [ ] Add `@free-parking/shared` package with `src/index.js`
- [ ] Import a constant into web + mobile to confirm workspace resolution

Deliverable: web + mobile both import shared.

## Day 3 — Share utilities

- [ ] Move `dateUtils` and `parkingUtils` into `packages/shared`
- [ ] Update web imports
- [ ] Create a small mobile screen that calls `formatAgeLabel()` and renders text

Deliverable: shared pure code used in both.

## Day 4–5 — Shared data core (start)

- [ ] Create storage adapters:
  - web: Promise-based wrapper over `localStorage`
  - native: AsyncStorage adapter
- [ ] Extract data core from `ParkingDataManager`:
  - realtime cache load/save
  - realtime fetch + parse
  - history cache load/save
  - CSV fetch + parse
- [ ] Keep providers per platform to wire core -> Zustand

Deliverable: mobile fetches realtime data and displays it.

## Notes specific to this repo

- Mobile does not need your `CORS_PROXY`.
- Statistics charting must be replaced on mobile; keep data shaping shared.
