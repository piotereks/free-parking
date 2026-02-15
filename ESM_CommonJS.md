# mobile/ — ESM vs CommonJS (content-aware)

Only JavaScript-style files are listed below (skipped: binaries, .md, .png, .sh, .json).
Detection is content-based: **ESM** = file contains top-level `import`/`export`; **CommonJS** = file contains `require(` or `module.exports`.
If both styles appear in a file it is marked in both columns.

| File | ESM | CommonJS |
|---|:---:|:---:|
| mobile/babel.config.js |  | ✅ |
| mobile/eslint.config.js |  | ✅ |
| mobile/vitest.setup.js | ✅ |  |
| mobile/vitest.config.js | ✅ |  |
| mobile/tailwind.config.js | ✅ |  |
| mobile/metro.config.cjs |  | ✅ |
| mobile/jest.config.js |  | ✅ |
| mobile/index.js | ✅ |  |
| mobile/App.js | ✅ | ✅ |
| mobile/App copy.js | ✅ | ✅ |
| mobile/AdMobManager.js | ✅ |  |
| mobile/src/App.js | ✅ |  |
| mobile/src/testShared.js | ✅ |  |
| mobile/src/hooks/useParkingStore.js | ✅ |  |
| mobile/src/screens/DashboardScreen.js | ✅ |  |
| mobile/src/context/ThemeContext.js | ✅ |  |
| mobile/src/context/ParkingDataProvider.js | ✅ |  |
| mobile/src/config/debug.js | ✅ |  |
| mobile/src/components/ParkingCard.js | ✅ | ✅ |
| mobile/src/components/LoadingSkeletonCard.js | ✅ |  |
| mobile/src/adapters/mobileStorageAdapter.js | ✅ |  |
| mobile/src/adapters/mobileFetchAdapter.js | ✅ |  |
| mobile/test/setup.js |  | ✅ |
| mobile/test/ThemeContext.test.js.skip | ✅ |  |
| mobile/test/store.test.js | ✅ |  |
| mobile/test/shared.test.js | ✅ |  |
| mobile/test/offline.test.js | ✅ |  |
| mobile/test/adapters.test.js | ✅ |  |
| mobile/test/screens/DashboardScreen.test.js.skip | ✅ | ✅ |
| mobile/test/screens/DashboardScreen.new.test.js.skip | ✅ |  |
| mobile/test/screens/DashboardScreen.minimal.test.js.skip |  | ✅ |
| mobile/vitest.config.js | ✅ |  |
| mobile/vitest.setup.js | ✅ |  |

---
Next steps:
- I can run a scan to convert `Mixed` files to consistent module style or
- produce a follow-up PR listing changes required to make the mobile package `type: "module"`.
Which would you like?