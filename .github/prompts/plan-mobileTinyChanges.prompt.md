## Plan: 100 Tiny Changes for the Mobile App ✅

TL;DR — I reviewed the `mobile/` folder and drafted **100 small, low-risk improvements** you can make right away (tests, accessibility, tiny UI tweaks, lint/test fixes, small refactors). Items are one-line actionable tasks and reference the files/components to change so you can pick and run with them quickly. 💡

---

**Steps — 100 tiny changes (single-line tasks)**

1. Add `accessibilityLabel` to the refresh `TouchableOpacity` in `src/App.js` (more descriptive than current label). 🔎  
2. Add a `testID="refresh-button"` to the refresh button in `src/App.js` for E2E tests. 🎯  
3. Use `import favicon from '../assets/favicon.png'` at top of `src/App.js` instead of `require(...)`. 📦  
4. Add `key` fallback to lists: use `key={d.ParkingGroupName ?? d.id ?? i}` in `src/App.js`. 🔑  
5. Memoize `getAggregatedStatus` with `useMemo` in `src/App.js` to avoid re-calculation every render. ⚡  
6. Replace `console.error` with `debugLog` (or add `debugLog` call) in catch blocks in `src/App.js`. 📝  
7. Add `testID` to the total spaces element in `src/App.js` for testing (e.g., `testID="total-spaces"`). 🔬  
8. Make `ActivityIndicator` color use theme (`useTheme().colors`) rather than hardcoded `#ffffff` in `src/App.js`. 🎨  
9. Add `accessibilityRole="image"` and `accessibilityLabel` to the favicon `Image` in `src/App.js`. 🖼️  
10. Use shared `normalizeParkingName` instead of inline `'Bank_1'` checks in `src/App.js`. ♻️  
11. Add unit test for `refreshHelper` behavior in `src/App.test.js` (new test file). ✅  
12. Add `test` to check 'Loading parking data...' state in `src/App.js`. 🧪  
13. Add `aria-like` accessibility text for the aggregated status message (`accessibilityLabel`) in `src/App.js`. 🗣️  
14. Add `testID` attributes for key UI pieces: last update, total status, status label in `src/App.js`. 🏷️  
15. Add `display: 'test-friendly'` JSDoc comments to `ParkingCard` props in `src/components/ParkingCard.js`. 📋  
16. Add `accessibilityHint` describing tap behavior to `TouchableOpacity` in `src/components/ParkingCard.js`. ✋  
17. Add unit test for tap-to-copy clipboard behavior in `src/components/ParkingCard.test.js`. 📱  
18. Add a small fallback clipboard implementation test when `expo-clipboard` is unavailable in `src/components/ParkingCard.test.js`. 📦  
19. Add `prop` shape JSDoc for `ParkingCard` (document expected fields: name/free/capacity/timestamp) in `src/components/ParkingCard.js`. 📑  
20. Add `accessible` and `accessibilityRole="status"` to `LoadingSkeletonCard` in `src/components/LoadingSkeletonCard.js`. ♿  
21. Add a test asserting `LoadingSkeletonCard` renders skeleton blocks (snapshot) in `test/`. 🖼️  
22. Add `accessibilityLabel` for the "Total Spaces" label in `src/App.js`. 🏷️  
23. Add a test for `createMobileFetchAdapter.fetchText` returning text in `test/adapters.test.js`. 🧾  
24. Handle `res.ok === false` in `fetchJSON` and throw a descriptive error in `src/adapters/mobileFetchAdapter.js`. 🚨  
25. Add a unit test for `fetchJSON` to assert it throws on non-OK responses (`test/adapters.test.js`). 🧪  
26. Add `AbortController` timeout to `fetchWithBust` as optional small improvement in `src/adapters/mobileFetchAdapter.js`. ⏱️  
27. Add test for `fetchWithBust` timeout behavior (mocking `fetch`) in `test/`. 🧰  
28. Wrap `JSON.parse` in `createMobileStorageAdapter.get` with try/catch and return `null` explicitly on parse error (improve clarity). 🔐  
29. Add `get(key, defaultValue = null)` overload to return a default value in `src/adapters/mobileStorageAdapter.js`. 🛡️  
30. Add tests verifying `get` returns `null` on parse error and respects default values in `test/adapters.test.js`. ✔️  
31. Add `AUTO_REFRESH_INTERVAL_MS` constant to `src/context/ParkingDataProvider.js` and replace `5 * 60 * 1000`. 🧮  
32. Add `setStopAutoRefresh` registration test in `test/` to ensure interval cleared on unmount of `ParkingDataProvider`. ⏳  
33. Add `AbortController` to cancel inflight fetches on unmount in `src/context/ParkingDataProvider.js`. ✂️  
34. Add a guard that prevents fetch when `API_URLS` is empty and log a debug warning in `src/context/ParkingDataProvider.js`. ⚠️  
35. Add a small retry count (1 retry) with short backoff on fetch failure in `src/context/ParkingDataProvider.js` (configurable constant). 🔁  
36. Add a test asserting `ParkingDataProvider` sets `lastRealtimeUpdate` at fetch start and end in `test/`. 🕒  
37. Remove unused `useRNColorScheme` import in `src/context/ThemeContext.js` (cleanup). 🧹  
38. Add a unit test verifying `ThemeProvider.setTheme` stores to AsyncStorage and updates mode (`test/ThemeContext.test.js`). 📦  
39. Add `toggleTheme()` helper to `ThemeContext` to cycle modes and a small test for it. 🔁  
40. Add a small README note in `mobile/README.md` on how to run mobile tests and lint locally. 📘  
41. Add `testID` to `FlatList` row items in `src/screens/DashboardScreen.js` to help tests identify rows. 🧷  
42. Use `useCallback` for `renderItem` in `src/screens/DashboardScreen.js` to avoid re-renders. 🔁  
43. Add `ListEmptyComponent` prop to `FlatList` for empty state instead of manual conditional in `src/screens/DashboardScreen.js`. 🧩  
44. Add a small "Retry" button when `realtimeError` is present in `src/screens/DashboardScreen.js`. 🔁  
45. Add a test covering the "Retry" button behavior that triggers `refreshCallback`. 🧪  
46. Add a `lastError` state in the Zustand store to capture and display last fetch error (small store change + small UI update). 🧾  
47. Add `testID="last-error"` and render last error message (when present) in `src/App.js` or `DashboardScreen`. ❗  
48. Add a `disabled` state or debounce for the Refresh button to prevent repeated taps within X seconds (small UX improvement). 🛑  
49. Add a small accessibility improvement: ensure the refresh button is at least 44x44 tappable area in `src/App.js`. 📐  
50. Add a small unit test to assert `calculateDataAge` behavior with mocked Date for determinism (`test/shared`). 🕰️  
51. Re-enable or fix skipped tests in `mobile/test/screens/*` that are `.skip` and add reason comments if flaky. 🔧  
52. Add snapshot tests for `ParkingCard` component rendering variant with `approx` true/false. 📸  
53. Add small inline comments for the approximation logic in `src/App.js` and `src/screens/DashboardScreen.js` to clarify intent. 📝  
54. Add a `testID` for total spaces count `testID="total-spaces-count"` and assert it in tests. ✅  
55. Add a `console.debug` wrapper helper that respects `debugLog` to avoid polluting logs in production in `src/config/debug.js`. 🔍  
56. Add unit tests around the mobile storage adapter error paths (simulate AsyncStorage throwing) in `test/`. 🛠️  
57. Add `eslint --fix` to a new npm script `lint:fix` in `mobile/package.json`. 🧽  
58. Add `.editorconfig` to `mobile/` (consistent indent and end-of-line). 📏  
59. Add `testID` on `LoadingSkeletonCard` blocks to assert UI in tests. 🧪  
60. Add `ListHeaderComponent` with last update time to `FlatList`, instead of separate header code duplication in `DashboardScreen`. 🧾  
61. Add defensive checks that timestamps are valid before formatting (small guard) in `src/screens/DashboardScreen.js`. 🛡️  
62. Add `try/catch` guard around `formatTime` calls to avoid crash on invalid inputs in `src/screens/DashboardScreen.js`. ⚠️  
63. Make `getAgeColorClass` (in `ParkingCard`) exportable and add unit tests for age color thresholds. 🎯  
64. Move magic numbers (5, 15, 1440) into named constants (e.g., `STALE_MINUTES`) in `src/App.js` and `src/screens/...`. 🔢  
65. Add `test:vitest` to CI recommendation in `mobile/README.md` (small docs). 🧾  
66. Add `testID` and `accessibilityLabel` for `Status` block in `src/App.js`. 🛠️  
67. Add small UI improvement: show small '≈' tooltip or accessible label explaining approximation (a11y: `accessibilityHint`) in `src/App.js`. ℹ️  
68. Add a small `useIsMounted` hook to safely avoid setting state after unmount in async functions (tiny helper). 🪢  
69. Replace repeated Tailwind class combinations with `const` variables where used multiple times (minor dedupe) in `src/` files. 🧩  
70. Add a small color contrast check comment for reviewers where amber/yellow text is used for warning states. ⚖️  
71. Add `jest` test to assert that `createMobileFetchAdapter.fetch` appends cache-bust once (add test when `?t=` already present) — strengthen existing tests. 🔁  
72. Add a small e2e-friendly `testID` for each `ParkingCard` with `testID={'parking-' + (item.id ?? index)}` in `DashboardScreen`. 🔖  
73. Add `error` boundary wrapper component (very small) and wrap `DashboardScreen` usage in `src/App.js`. 🧱  
74. Add small UI hint to pull-to-refresh in empty state (in `DashboardScreen`) — short one-line hint. 🍃  
75. Add small debounce to setLastRealtimeUpdate calls to reduce frequent writes (micro-optimization) in `ParkingDataProvider`. 🪄  
76. Add small logging when `cacheCleared` is true in `ParkingDataProvider` and show a brief toast in UI (optional small change). 🔔  
77. Add `testID` to header update `formatTime` output and assert formatting in tests. ⏱️  
78. Add a small `strings` object in `src/strings.js` and replace hard-coded strings (first step to i18n). 🌐  
79. Update `mobile/package.json` to include `engines.node` specifying Node LTS (minor metadata). 📦  
80. Add small `npm script` `check:deps` (runs `npm audit --json` and prints summary) in `mobile/package.json`. 🔒  
81. Add a small `debug` flag in `createMobileFetchAdapter` to optionally log request durations (opt-in). 🧭  
82. Add `test` asserting `createMobileStorageAdapter` logs "HIT"/"MISS" via `debugLog` in tests (spy on debug). 🕵️  
83. Add `AccessibilityRole="button"` and `accessibilityState={{ busy: refreshing }}` when `refreshing` to help screen readers (in `src/App.js`). 🔈  
84. Add small fix: ensure `Date` normalization uses `replace(' ', 'T')` in all places for consistency (search & fix) (`src/screens/DashboardScreen.js`). 🔎  
85. Add small unit test verifying `formatAgeLabel` display value used in components is correct (bridge test between shared and mobile). 🔗  
86. Add small check to prevent `processed.length` loops when data isn't an array (guard) in `src/App.js`. 🛡️  
87. Add `prettier` or unify formatting via `eslint` config small tweak (add `--max-warnings=0` for CI). 🧯  
88. Add `README` section describing how to run tests that mock AsyncStorage/fetch (helpful for contributors). 📚  
89. Adjust `jest` config to map `parking-shared` resolution clearly (small tweak if necessary) in `jest.config.js`. 🧩  
90. Add a test asserting the `ParkingDataProvider` stops auto-refresh on unmount (small lifecycle test). 🚦  
91. Add small `console.warn` when invalid theme is saved in `ThemeContext.setTheme` (currently it warns; make test to assert warning). ⚠️  
92. Add tiny performance improvement: avoid mapping `processed.forEach` twice in same effect — compute once into variables in `src/App.js`. 🔁  
93. Replace repeated date creation `new Date()` with `now` where appropriate to keep consistent timing across calculations in `src/App.js`. 📆  
94. Add small comment explaining why `calculateDataAge` sometimes returns `Infinity` and how components handle it (docs inline). 🗒️  
95. Add small test ensuring that `ParkingCard` shows `(orig: N)` when approx present (component assertion). ✅  
96. Improve message when `realtimeError` is shown — include short actionable hint like "pull to retry" in `src/screens/DashboardScreen.js`. 💬  
97. Add `eslint` rule to disallow unused imports so future unused `useRNColorScheme` is caught automatically. 🔧  
98. Add `CHANGELOG.md` entry under `mobile/` for small upcoming changes (starter entry). 📄  
99. Add `test` to ensure that duplicated query params don't cause double `t` param in `fetchWithBust` (edge-case test). 🧪  
100. Add small `TINY_MODIFICATIONS.md` entries cross-referenced to the top 20 highest-value items so contributors can pick easy wins. 🗂️

---

## Verification ✅

- Run unit tests: npm --prefix mobile test (Jest) and npm --prefix mobile run test:vitest where applicable.  
- Run lint: npm --prefix mobile run lint and use lint:fix for quick auto-corrections.  
- Manual checks: open Expo (`npm start`) and verify refresh button, headers, accessibility labels (VoiceOver/TalkBack).  
- For each change that adds `testID`, add a small Jest test asserting component render and element presence.

---

## Decisions & Notes ✨

- Presentation selected: **single-line task list** (you chose this).  
- Implementation: you chose **not** to implement now; I can implement the top N items if you'd like.  
- I focused on low-risk, one-file-or-test changes that are easy to review and revert. If you'd like, I can prioritize or produce PRs for the top 10 most impactful items (tests + accessibility + small bugfixes).

> Quick tip: If you want, I can generate PR branches for the top 10 items and include test coverage and changelog entries so it's ready for review. Would you like me to proceed with that? (I can start with items 1–10 or 15–25 — your choice.)

---

If you'd like, I can now:
- Export this list as issues in `mobile/` (one per item), or
- Create PRs for a selected subset (I recommend starting with accessibility + tests + fetch/storage robustness).

Which next step do you prefer?
