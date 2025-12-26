# Mobile Dev Setup - Windows Known Issues

## Issue: Expo CLI on Windows fails with `node:sea` path error

### Symptoms
```
Error: ENOENT: no such file or directory, mkdir '...\mobile\.expo\metro\externals\node:sea'
```

### Root Cause
Expo 50.0.0 on Windows has compatibility issues with Node.js builtins paths containing colons (`node:sea`). This is a known issue in the Expo ecosystem on Windows.

### Workarounds

#### Option 1: Use WSL2 (Recommended)
Run the dev server from Windows Subsystem for Linux:
```bash
# From WSL2 terminal
cd /mnt/c/Users/piote/PycharmProjects/free-parking
npm run dev:mobile
```

#### Option 2: Use macOS/Linux
If developing on a Mac or Linux machine, the dev server will start without issues.

#### Option 3: Use Expo Go (Quick Testing)
Instead of the full dev server, use Expo Go for quick testing:

1. Install Expo Go app on iOS/Android device
2. Build and generate a QR code:
   ```bash
   npx eas build --platform ios --profile preview
   npx eas build --platform android --profile preview
   ```
3. Scan QR code from Expo dashboard

#### Option 4: Upgrade Expo (When Available)
Expo 51.0.0+ may have Windows fixes. To upgrade:
```bash
npm install expo@latest --save --workspace=packages/mobile
```

### Temporary Solution for Windows Development
Until Expo fixes Windows compatibility, you can:

1. **Build without dev server**:
   ```bash
   npx eas build --platform android --local
   npx eas build --platform ios --local  # macOS only
   ```

2. **Test on physical device via EAS Build**:
   ```bash
   npm run build:mobile:ios
   npm run build:mobile:android
   ```

3. **Test web version**:
   ```bash
   npm run dev:web  # Web dashboard works fine
   ```

### Development on Shared Package
Since mobile reuses business logic from `@free-parking/shared`, you can develop most features on the web dashboard and test in the mobile app once the dev server works:

```bash
# Terminal 1: Develop shared logic via web
npm run dev:web

# Terminal 2: Build mobile periodically
npm run build:mobile:ios
npm run build:mobile:android
```

### Next Steps
1. If you have WSL2 installed, use that for mobile dev
2. Otherwise, focus on web dashboard development and periodic mobile builds
3. Monitor Expo GitHub issues for Windows compatibility fixes

---

**Reference**: https://github.com/expo/expo/issues (search "Windows node:sea")
