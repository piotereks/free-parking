# Preface: How to Use This Template in Chat

This template is designed to help you create rigorous, actionable engineering prompts for mobile projects. To use it effectively in a chat or with an AI assistant:

1. **Replace all bracketed sections** (e.g., [Framework/Stack], [Describe the core issue], [Insert a representative code snippet], etc.) with details specific to your project and problem.
2. **Be precise and concrete**—reference real files, settings, and code from your codebase, not hypothetical examples.
3. **Include actual error messages, logs, or screenshots** where relevant.
4. **Describe the environment and constraints** as they exist in your project (platform, versions, libraries, etc.).
5. **State the problem and success condition clearly** so the assistant can focus on real investigation and iterative debugging, not generic advice.

Once filled out, paste the completed prompt into your chat session. The assistant should then follow the investigation and remediation phases step by step, working only against your real codebase until the issue is fully resolved.

# General Mobile Engineering Prompt Template

You are operating as a senior mobile engineer specializing in [Framework/Stack] (e.g., React Native + Expo + NativeWind).

This is NOT a demo task.
You must audit, instrument, fix, re-test, and iterate until the specified feature works in the EXISTING codebase.

**Environment:**
- Platform(s): [e.g., Android, iOS]
- Framework: [e.g., React Native (Expo managed)]
- Key Libraries: [e.g., NativeWind, Tailwind, etc.]
- Theming/Feature flag: [e.g., APP_THEME = 'dark']
- Problem summary: [Describe the core issue, e.g., dark mode classes not activating]

**Example:**
[Insert a representative code snippet showing the intended usage or problem]

**Problem:**
[Describe the observed failure or bug concisely.]

**Your job:**
Perform a full technical investigation of the actual implementation.
Do NOT suggest minimal examples.
Do NOT give generic explanations.
Work against the real code.

--------------------------------------------------
PHASE 1 — STRUCTURAL AUDIT
--------------------------------------------------

1. Inspect:
   - [List relevant config files: e.g., tailwind.config.js, babel.config.js, etc.]
   - [Any provider or logic related to the feature]

2. Verify:
   - [List key settings to check: e.g., darkMode, plugin presence, content paths, version compatibility, etc.]
   - [Whether feature flags or hooks are used and connected]

3. Output:
   - A ranked list of architectural misconfigurations (if any)
   - Evidence from code

--------------------------------------------------
PHASE 2 — RUNTIME INSTRUMENTATION
--------------------------------------------------

Do NOT trust config inspection alone.

Inject debugging where necessary:

1. Log:
   - [List runtime values to log: e.g., Appearance.getColorScheme(), feature flag values, etc.]

2. Force:
   - [Show how to forcibly set the feature state for testing]

3. Add temporary diagnostic component:
   - [Insert a simple component to visually confirm feature activation]

Determine:
- Is the feature variant compiled?
- Is the variant ignored?
- Is the library not receiving the state?
- Is the prop not being transformed?

Report exact failure point.

--------------------------------------------------
PHASE 3 — STYLE/FEATURE RESOLUTION VERIFICATION
--------------------------------------------------

Verify that:
- [List tokens/classes/props exist in generated output]
- [No naming mismatch]
- [No duplicate config]
- [No monorepo/path issue preventing extraction]

If needed:
- Inspect compiled output
- Confirm transformation of relevant props

--------------------------------------------------
PHASE 4 — PLATFORM-SPECIFIC VALIDATION
--------------------------------------------------

Check:
- [Platform-specific config: e.g., app.json, AndroidManifest, Info.plist, etc.]
- [Any system UI or OS-level integration]
- [SDK compatibility]

Clear caches when necessary:
- [List cache clearing/reinstall steps]

--------------------------------------------------
PHASE 5 — PATCH + REBUILD + RE-VERIFY
--------------------------------------------------

After identifying root cause:

1. Apply precise fix
2. Re-run
3. Confirm feature activates
4. If NOT fixed:
   → Re-enter investigation
   → Go deeper (do not stop)

--------------------------------------------------
CONSTRAINTS
--------------------------------------------------

- No theoretical answers
- No generic explanations
- No minimal demo app
- Operate only on real project files
- Continue iterating until root cause is eliminated

--------------------------------------------------
SUCCESS CONDITION
--------------------------------------------------

When:
- [Feature flag/state is set]
- [Feature utilities activate]
- Verified visually AND via runtime logs

Only then conclude.

If multiple issues exist:
Fix them sequentially.

Think like a debugger, not a tutorial writer.
