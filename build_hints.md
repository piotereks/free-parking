Local development build and install (Android) — no EAS

This file explains quick, local-only steps to produce and install a development APK or dev client on a connected device/emulator.

1) Verify device / adb

```powershell
where.exe adb
adb devices
```

Start an AVD or connect a physical device (enable USB debugging).

2) Build + install (Gradle wrapper)

From project root (preferred):

```powershell
cd android
.\gradlew.bat installDebug
```

This compiles and installs the debug APK directly to the first connected device.

If you want to split build + install:

```powershell
cd android
.\gradlew.bat assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

3) Expo-managed project (local dev client)

If this is an Expo-managed project and you need a dev client locally (no EAS):

```powershell
# generate native projects if needed
npx expo prebuild
# build & install dev client locally
npx expo run:android
```

4) Common fixes

- Remove conflicting app before installing:

```powershell
adb uninstall com.freeparking.mobile
.\gradlew.bat installDebug
```

- If `adb` not found, ensure Android SDK `platform-tools` is on `PATH` (e.g. `%ANDROID_SDK_ROOT%\platform-tools`).

- If `gradlew.bat` is missing, regenerate wrapper or run `gradle wrapper` with a locally installed Gradle, or bootstrap the project with `npx expo prebuild` (for Expo).

5) Verify and launch

```powershell
adb shell pm list packages | findstr freeparking
adb shell monkey -p com.freeparking.mobile -c android.intent.category.LAUNCHER 1
```

6) Troubleshooting notes

- Use `--stacktrace --info` with Gradle to get detailed logs: `.\gradlew.bat assembleDebug --stacktrace --info`.
- If install fails with signature or version conflicts, uninstall the existing app (`adb uninstall`) before installing.
- For large projects, builds may take time; ensure sufficient memory for Gradle (`org.gradle.jvmargs` in `android/gradle.properties`).

7) When to use EAS vs local

- Use local builds for iterative development, testing on physical devices or emulators.
- Use EAS only when you need cloud builds (managed credentials, CI, or distribution) — not required for local development.

If you want, I can add platform-specific shortcuts to `package.json` scripts (e.g., `npm run android:install`) — tell me if you want that added.
