# Parking Availability App - Phase 3 Detailed Plan

This document contains items moved from Phase 2 for longer-term follow-up and additional Phase 3 work.

#### Iteration: Data Manager, Navigation & Polish (moved from Phase 2)

Objectives: Implement data fetching (real-time + history), set up navigation between Dashboard/Stats, add error boundaries, polish UI, finalize offline support.

Tasks:

1. Create MobileDataManager.js — Analogous to web's ParkingDataManager:
   - Fetch realtime data from two API endpoints
   - Parse responses using shared's `parseApiEntry()` + `cloneApiResults()`
   - Fetch CSV history if needed
   - Cache to mobile storage via adapter
   - Auto-refresh every 5 minutes
   - Handle errors gracefully
   - Register `refreshCallback` to store
   - Key difference from web: No Google Forms submission (optional for mobile MVP)
2. App.js root structure:
   - Setup `DataManagerProvider` (provides `useDataManager()` hook)
   - Setup React Navigation (React Navigation + React Native Navigation)
     - `createNativeStackNavigator()`
     - Two screens: Dashboard, Statistics
     - Tab navigator (bottom tabs, icons via Vector Icons)
   - Setup `ThemeProvider` (light/dark via Appearance API)
   - Setup `ErrorBoundary` (try/catch wrapper for RN)
3. ErrorBoundary.js:
   - Catch render errors
   - Display "Something went wrong" screen
   - Show reset button
4. Data refresh trigger:
   - On app launch, call `MobileDataManager.startAutoRefresh()` (5-min interval)
   - On navigation to Dashboard, trigger immediate refresh (optional)
   - On pull-to-refresh gesture (FlatList), trigger refresh
5. Pull-to-refresh — DashboardScreen:
   - Use FlatList's `refreshing` + `onRefresh` props
   - Show refresh spinner
   - Call store's `refreshCallback()`
6. Unit tests — `test/MobileDataManager.test.js`:
   - Mock fetch adapter
   - Test realtime fetch + cache cycle
   - Test history fetch + CSV parsing
   - Test error handling
   - Test auto-refresh interval setup
7. Integration tests — `test/integration/dataFlow.test.js`:
   - Simulate full data fetch → store update → UI render flow
   - Mock network, verify store, verify component updates

Validation Steps:

- [ ] `npm test` passes (MobileDataManager.test.js, integration tests)
- [ ] `npm run lint` passes
- [ ] Emulator: Dashboard auto-refreshes every 5 minutes (timer visible in logs)
- [ ] Pull-to-refresh gesture works (spinner shows, data updates)
- [ ] Navigation between Dashboard/Stats works smoothly
- [ ] Error state displays recoverable message + retry button
- [ ] App runs offline (no crashes, cached data displays)
- [ ] No console errors/warnings

Checklist:

- [ ] mobile/src/MobileDataManager.js (fetch + cache cycle)
- [ ] mobile/src/App.js (navigation + providers)
- [ ] mobile/src/navigation/ (stack + tab navigators)
- [ ] mobile/src/components/ErrorBoundary.js (error catch)
- [ ] mobile/src/components/PullToRefresh.js (if needed)
- [ ] test/MobileDataManager.test.js
- [ ] test/integration/dataFlow.test.js
- [ ] Verify offline cache shapes match web
- [ ] docs: Update copilot_instructions.md (navigation, data flow)

Documentation Updates:

- Update MIGRATION_PLAN.md Iteration Log (Iteration moved to Phase 3)
- Create mobile/ARCHITECTURE.md (data flow, component tree)

---

#### Iteration: CI/CD, Testing Coverage & Release (moved from Phase 2)

Objectives: Set up GitHub Actions for Expo builds, achieve 80%+ test coverage, document all iterations, tag v0.1.0-beta.0 release.

Tasks:

1. GitHub Actions — Expo CI/CD — `.github/workflows/mobile-ci.yml`:
   - Job: lint-and-test
     - Checkout code
     - Setup Node.js 22.x (from .nvmrc)
     - Cache dependencies
     - Prebuild shared package (`npm run build` in shared/)
     - Install mobile deps
     - Run `npm run lint` (0 errors)
     - Run `npm run test` (0 failures)
     - Run `npm run test:coverage` (report >80%)
   - Job: build-expo
     - Runs after lint-and-test passes
     - Install EAS CLI
   - Build APK via Gradle on a self-hosted runner: `cd android && ./gradlew assembleRelease` (fully local, requires Android SDK/JDK on runner)
     - Upload APK as artifact
     - (iOS optional: requires macOS runner)
   - Trigger: Push to `feature/mobile` or PR to `main`
2. Test coverage targets:
   - Shared package: Already >80% (Phase 1)
   - Mobile adapters: >85% (storage, fetch error paths)
   - Mobile components: >80% (Dashboard, Statistics)
   - Store integration: >80% (all actions tested)
   - Data manager: >80% (fetch, cache, error flows)
   - Overall mobile: >80%
3. Coverage report:
   - Use Vitest's `--coverage` flag (c8 provider)
   - Generate HTML report
   - Upload to artifacts or comment on PR
4. Version & changelog:
   - Tag git commit: `git tag v0.1.0-beta.0`
   - Create mobile/CHANGELOG.md

5. Unit tests expansion:
   - Ensure all utility functions tested
   - Ensure all components tested (happy path + error states)
   - Ensure all adapters tested (with mocks)
6. E2E validation (manual) — Run on emulator/device:
   - [ ] App launches, shows Dashboard (cached or live data)
   - [ ] Real-time data refreshes every 5 min
   - [ ] Pull-to-refresh works
   - [ ] Switch to Statistics, charts render
   - [ ] Switch back to Dashboard, data persists
   - [ ] Theme toggle changes colors
   - [ ] Close app, reopen → data from cache
   - [ ] Clear cache from settings → fresh load on next refresh
   - [ ] Network error → graceful fallback to cache
7. Documentation finalization:
   - Update MIGRATION_PLAN.md with complete Phase 2 Iteration Log
   - Update mobile/README.md with full setup + development guide
   - Update root README.md with mobile section
   - Update copilot-instructions.md with mobile-specific patterns
8. Semantic versioning:
   - Shared: v0.1.0-alpha.0 (Phase 1 complete)
   - Mobile: v0.1.0-beta.0 (Phase 2 MVP complete)
   - Web: Remains on current version (no breaking changes)

Validation Steps:

- [ ] `npm run lint` passes in mobile (0 errors)
- [ ] `npm run test` passes (0 failures)
- [ ] `npm run test:coverage` reports >80% coverage
- [ ] GitHub Actions workflow runs successfully (lint, test, build)
- [ ] APK artifact generated and downloadable
- [ ] E2E manual testing on Android emulator (all checklist items pass)
- [ ] Release tag `v0.1.0-beta.0` created
- [ ] All documentation updated

Checklist:

- [ ] .github/workflows/mobile-ci.yml (lint, test, build jobs)
- [ ] mobile/vitest.config.js configured for coverage
- [ ] mobile/package.json with test:coverage script
- [ ] All existing tests updated to >80% coverage
- [ ] mobile/CHANGELOG.md (v0.1.0-beta.0)
- [ ] mobile/README.md (full setup guide)
- [ ] MIGRATION_PLAN.md Phase 3 Iteration Log complete
- [ ] copilot-instructions.md updated (mobile section)

---

Further Considerations:

1. Google Forms submission — Currently web-only (no-cors). Should Phase 3 add it to mobile, or defer indefinitely? Recommend Phase 3 if analytics needed.

2. iOS support — Phase 3 should include iOS plans (macOS CI runner + Apple provisioning).

3. E2E testing — Phase 3 should add Detox or other RN E2E framework for automated CI.

4. Chart library trade-off — Evaluate once more in Phase 3; maintain victory-native for now.

5. Shared package versioning — Plan bump to v0.1.0-rc.0 in Phase 3 once mobile stabilizes.

6. Web + Mobile parity — Address differences (echarts vs. victory-native) in Phase 3.

7. Build automation — Phase 3 may add auto-deployment to Expo Preview or App Store Testflight.
