# React Native (Expo) migration docs

This folder contains a repo-specific guide for migrating **this** project (a Vite + React SPA) to a **monorepo** that keeps the existing web app deployable while adding an **Expo** app for Android/iOS (and optionally Expo Web).

## Recommended end state

- Keep the current web SPA as-is (React DOM + Vite + Tailwind) and continue deploying it as you do today.
- Add a new Expo app for mobile.
- Share *business logic* (API/data-fetch, parsing, caching model, Zustand store, utilities) via a `packages/shared` package.
- Only share UI components if/when you decide to move the web UI to React Native Web (this is optional and higher effort).

## Docs index

- Monorepo layout + setup: [01-monorepo-setup.md](01-monorepo-setup.md)
- Shared code strategy (what to share, how): [02-shared-code-strategy.md](02-shared-code-strategy.md)
- Migration phases + checklists: [03-migration-phases.md](03-migration-phases.md)
- Deployment (web + mobile + optional web-from-expo): [04-deployment.md](04-deployment.md)

## Quick decision summary (defaults used in this guide)

- **Monorepo tool**: `npm workspaces` (lowest friction with your existing `npm` scripts)
- **Web app stays Vite**: yes
- **Mobile app**: Expo (Managed Workflow) + EAS builds
- **Shared UI**: not in phase 1; reconsider after shared business logic is stable
