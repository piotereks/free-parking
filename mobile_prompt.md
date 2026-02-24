You are operating as a senior React Native + Expo + NativeWind engineer.

This is NOT a demo task.
You must audit, instrument, fix, re-test, and iterate until dark mode works in the EXISTING codebase.

Environment:
- Android
- React Native (Expo managed)
- NativeWind (Tailwind for RN)
- Theming via APP_THEME = 'dark'
- dark: classes not activating

Example:
<View className="flex-1 border border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark" />

Problem:
Dark styles are NOT applied even though APP_THEME = 'dark'.

Your job:
Perform a full technical investigation of the actual implementation.
Do NOT suggest minimal examples.
Do NOT give generic explanations.
Work against the real code.

--------------------------------------------------
PHASE 1 — STRUCTURAL AUDIT
--------------------------------------------------

1. Inspect:
   - tailwind.config.js
   - babel.config.js
   - metro.config.js (if exists)
   - app.json / app.config.js
   - package.json (NativeWind version)
   - Any ThemeProvider or color scheme logic

2. Verify:
   - darkMode setting in tailwind.config.js
   - NativeWind babel plugin presence
   - Correct content paths
   - Version compatibility (Expo SDK vs NativeWind)
   - Whether setColorScheme is used
   - Whether useColorScheme() is relied upon
   - Whether APP_THEME is actually connected to NativeWind

3. Output:
   - A ranked list of architectural misconfigurations (if any)
   - Evidence from code

--------------------------------------------------
PHASE 2 — RUNTIME INSTRUMENTATION
--------------------------------------------------

Do NOT trust config inspection alone.

Inject debugging where necessary:

1. Log:
   - Appearance.getColorScheme()
   - useColorScheme()
   - NativeWind resolved scheme
   - APP_THEME value at runtime

2. Force:
   import { setColorScheme } from 'nativewind'
   setColorScheme('dark')

3. Add temporary diagnostic component:
   <View className="bg-white dark:bg-black">
   and confirm visual change.

Determine:
- Is dark variant compiled?
- Is dark variant ignored?
- Is NativeWind not receiving scheme?
- Is className not being transformed?

Report exact failure point.

--------------------------------------------------
PHASE 3 — STYLE RESOLUTION VERIFICATION
--------------------------------------------------

Verify that:
- border-border-dark exists in generated styles
- theme.extend.colors includes required tokens
- no naming mismatch
- no duplicate tailwind config
- no monorepo path issue preventing class extraction

If needed:
- Inspect NativeWind compiled output
- Confirm Babel transformation of className prop

--------------------------------------------------
PHASE 4 — EXPO + ANDROID SPECIFIC VALIDATION
--------------------------------------------------

Check:

- app.json includes:
  "userInterfaceStyle": "automatic"

- expo-system-ui usage
- AndroidManifest theme overrides
- Expo SDK compatibility

Clear caches when necessary:
- expo start -c
- Reinstall node_modules if required

--------------------------------------------------
PHASE 5 — PATCH + REBUILD + RE-VERIFY
--------------------------------------------------

After identifying root cause:

1. Apply precise fix
2. Re-run
3. Confirm dark:bg-* activates
4. If NOT fixed:
   → Re-enter investigation
   → Go deeper (do not stop)

--------------------------------------------------
CONSTRAINTS
--------------------------------------------------

- No theoretical answers
- No generic Tailwind explanation
- No minimal demo app
- Operate only on real project files
- Continue iterating until root cause is eliminated

--------------------------------------------------
SUCCESS CONDITION
--------------------------------------------------

When:
- APP_THEME = 'dark'
- dark: utilities activate
- Verified visually AND via runtime logs

Only then conclude.

If multiple issues exist:
Fix them sequentially.

Think like a debugger, not a tutorial writer.
