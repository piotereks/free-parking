# Android emulator & WSL connection manual

This document collects the steps, commands and troubleshooting notes for running an Android emulator on Windows and connecting to it from WSL2. It also lists the reliable workflows we used during the session (start/verify ADB, two connection options, firewall notes and common fixes).

---

## Quick summary
- Preferred approach: run emulator on Windows and reuse the Windows ADB server from WSL (reliable for WSL2).
- Fallback: enable adb tcpip 5555 on Windows and adb connect <WIN_IP>:5555 from WSL (less reliable).
- If you don't have the Android emulator installed, install Android Studio or the SDK command-line tools and the emulator package.

---

## 1. Start emulator standalone (no project required)

### Windows (cmd.exe)
- Check SDK location (common default):

```
echo %LOCALAPPDATA%\Android\Sdk
```

- List available AVDs:

```
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -list-avds
```

- Start an AVD by name:

```
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd <AVD_NAME>
```

### Create/Install AVD from CLI (if needed)

```
"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools" "emulator" "platforms;android-31" "system-images;android-31;google_apis;x86_64"

"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd -n myAVD -k "system-images;android-31;google_apis;x86_64" --device "pixel"
```

Notes:
- You can also use Android Studio → Configure → AVD Manager → Create Virtual Device → Play.
- For acceleration, enable WHPX/Hyper-V on Windows (or Intel HAXM if not using Hyper-V).

---

## 2. Recommended: reuse Windows ADB server from WSL (Option B)

This avoids networking quirks with WSL2 and emulator tcpip binding.

### Windows (cmd.exe, run as Administrator)

1. Kill and start adb server listening on all interfaces:

```
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" kill-server
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" -a nodaemon server start
```

2. Confirm adb on Windows sees emulator:

```
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices -l
```

3. If Windows firewall might block WSL, add rule to allow port 5037:

```
netsh advfirewall firewall add rule name="ADB Server" dir=in action=allow protocol=TCP localport=5037
```

4. Check that adb is listening on 0.0.0.0:5037 (or [::]:5037):

```
netstat -an | findstr 5037
```

### WSL (bash)

1. Install adb client (if needed):

```
sudo apt update
sudo apt install android-tools-adb
```

2. Obtain the Windows host IP used by WSL (do not rely on nameserver blindly if it looks wrong):

```
WSL_HOST_IP=$(grep nameserver /etc/resolv.conf | awk '{print $2}')
echo "Windows host IP (from /etc/resolv.conf): $WSL_HOST_IP"
# If that looks wrong, run `ipconfig` on Windows and copy the IPv4 of the vEthernet/WSL or main adapter.
```

3. Point adb client to the Windows adb server and verify

```
export ADB_SERVER_SOCKET=tcp:${WSL_HOST_IP}:5037
adb devices
```

Expected: the emulator appears in the adb devices output.

Notes:
- If adb devices in WSL prints connection refused, ensure netstat -an on Windows shows listening on 0.0.0.0:5037 and firewall allows it.

---

## 3. Fallback: enable adb-over-TCP on emulator (Option A)

Use this if you cannot get Windows ADB server reachable from WSL.

### Windows (cmd.exe)

```
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" tcpip 5555
```

### WSL

```
WSL_HOST_IP=$(grep nameserver /etc/resolv.conf | awk '{print $2}')
adb connect ${WSL_HOST_IP}:5555
adb devices
```

Notes:
- The emulator will accept TCP connections on port 5555, but WSL network routing sometimes prevents connecting; prefer Option B when possible.

---

## 4. Troubleshooting checklist

- If adb devices shows Connection refused from WSL:
  - Ensure Windows adb server started with -a nodaemon server start (Admin) so it binds 0.0.0.0.
  - Run netstat -an | findstr 5037 on Windows and confirm LISTENING on 0.0.0.0:5037.
  - Verify firewall rule exists or add the rule above.
  - Verify Windows host IP used by WSL is correct (use ipconfig in Windows to confirm the vEthernet/WSL adapter address).

- If emulator isn't visible on Windows:
  - Start AVD Manager in Android Studio and launch emulator.
  - Run the platform-tools adb devices -l on Windows to confirm.

- If you see failed to connect to '<IP>:5037' then the adb server isn't listening on that IP; re-run start commands as Administrator.

---

## 5. Quick Expo/dev commands

- Start Expo dev server (mobile package):

```
# starts metro and Expo local CLI
npm run dev:mobile   # runs `npx expo start` in packages/mobile

# start directly on Android from mobile workspace (after ADB connected)
npx expo start --android
```

---

## 6. Notes and recommendations

- Prefer Option B (reuse Windows ADB server) for WSL2: it avoids common connection failures.
- Always verify the Windows side first: if Windows cannot see the emulator, fix that before troubleshooting WSL.
- If you frequently need ADB from WSL, consider adding export ADB_SERVER_SOCKET=tcp:<WIN_IP>:5037 to ~/.bashrc (replace <WIN_IP>).

---

If you want, I can also add a short troubleshooting checklist into README.md or create a scripts/connect-adb-wsl.sh helper for you.