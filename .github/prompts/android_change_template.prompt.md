# Template variables
# PLATFORM       – e.g. "Expo managed Android" or "bare React‑Native Android"
# FEATURE        – short description of what should be added/changed
# ARTIFACT       – expected output (APK, AAB, library, log, etc.)
# EXAMPLE_VIEW   – small JSX/Java snippet illustrating UI or behaviour
# VERB_STEPS     – list of generic verification steps (install, log, lock, etc.)

Environment:
- ${PLATFORM}
- Goal: implement ${FEATURE} for Android
- Desired output: ${ARTIFACT} produced locally, ready for distribution

Example component / snippet:
${EXAMPLE_VIEW}

Expected behaviour:
- [Describe behaviour in neutral terms; e.g. “app responds to X events”,
  “state available via hook/context”, etc.]
- [List any runtime requirements – logs, locks, real‑time updates]

MISSION:
Make the Android app support ${FEATURE}. Iterate until the
behaviour is 100 % correct and the ${ARTIFACT} can be built and installed
without using cloud services.

---

STEP 1 — VERIFY APIs & DEPENDENCIES
- Ensure required packages are installed (e.g. `expo‑screen‑orientation`,
  `react‑native‑…`, etc.)
- Confirm the Android project config allows local builds
- Check that a device/emulator can exercise the relevant API

---

STEP 2 — CORE IMPLEMENTATION
- Create the necessary provider/hook/module (state + updater functions)
- Wire up event listeners or native modules as needed
- Expose `use…()` or context to consumer components

---

STEP 3 — EXAMPLE USAGE
- Build a minimal component using the new API
- It should visibly change/update when the feature is exercised
- Log events/state changes for debugging

---

STEP 4 — AUTOMATED TESTING & ITERATION
- Run on Android emulator/device
- Verify detection/updates/locking/edge cases
- Fix breakage until tests and manual checks pass

---

STEP 5 — LOCAL BUILD
- Run the local Android build command (`eas build --local`, `./gradlew bundleRelease`, …)
- Ensure ${ARTIFACT} is created, signed, and installs successfully
- Include any necessary keystore or prebuild steps

---

DELIVERABLES
- Implementation code (provider/hook/etc.)
- Example/demo component
- Debug logs demonstrating correct behaviour
- Locally‑built ${ARTIFACT}
- Notes on build requirements
