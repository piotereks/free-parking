Environment:
- Android app (Expo managed workflow)
- React Native
- Goal: add full runtime screen orientation support
- Desired output: fully tested, production-ready `.aab` file built locally, no cloud service

Example component:
<View className="flex-1 p-3 rounded-lg bg-blue-200" />

Expected behavior:
- App detects device orientation in real time (portrait / landscape)
- Components access current orientation via a hook or context
- Screens/components can optionally lock orientation
- Orientation changes automatically update UI state
- Debug logging confirms orientation events
- App builds locally into an `.aab` file ready for Android distribution

MISSION:
Implement a fully functional screen orientation system in Expo React Native.
Iterate and auto-test the prototype until it works perfectly.
Once stable, build a local Android `.aab` file automatically.

---

STEP 1 — VERIFY ORIENTATION API
- Ensure `expo-screen-orientation` is installed
- Confirm Expo config supports Android local builds
- Verify device/simulator reports orientation events

---

STEP 2 — CREATE ORIENTATION PROVIDER
- Implement a React Context provider:
  - State: `orientation` ('portrait' | 'landscape')
  - Function: `lockOrientation(orientation)` to lock/unlock orientation
- Listen to orientation changes via `ScreenOrientation.addOrientationChangeListener`
- Provide `useOrientation()` hook
- Components automatically receive updates on orientation change

---

STEP 3 — EXAMPLE COMPONENT USAGE
- Minimal component that:
  - Reads orientation from context
  - Updates layout or styles based on orientation
  - Logs orientation changes for verification
- Example mapping:
  - Portrait → blue background
  - Landscape → green background

---

STEP 4 — AUTOMATED TESTING & ITERATION
- Agent must test prototype on Android emulator/device
- Continuously fix and verify:
  - Orientation detection accuracy
  - State propagation to components
  - Lock/unlock behavior
- Only stop when prototype is **100% functional**

---

STEP 5 — LOCAL BUILD TO `.AAB`
- Configure Expo to produce local Android build:
  - Use `eas build --platform android --local` or equivalent
  - Ensure `.aab` output is generated in local filesystem
  - Validate that the `.aab` installs and launches on an emulator/device
- Include all necessary steps:
  - Clearing caches (`npx expo start -c`)
  - Running prebuild scripts if needed
  - Setting Android keystore for signing
  - Producing `.aab` without cloud services

---

STEP 6 — DELIVERABLES
- OrientationProvider + hook
- Example component using orientation state
- Debug logs showing orientation events
- Local `.aab` file ready to install
- Instructions for any local build dependencies

Goal:
Deliver a **fully functional screen orientation system** in Expo React Native, fully tested, iterated, and producing a **locally built `.aab` file** ready for Android deployment.