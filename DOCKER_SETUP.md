# Docker Setup for Mobile Development (Rancher Desktop)

This setup uses Docker containers to run the Expo dev server, bypassing Windows path limitations.

## Prerequisites

1. **Install Rancher Desktop**: https://rancherdesktop.io/
2. **Configure Rancher Desktop**:
   - Open Rancher Desktop
   - Go to Settings → Kubernetes → Disable Kubernetes (optional, not needed)
   - Go to Settings → Container Engine → Select "dockerd (moby)"
   - Ensure port forwarding is enabled

## Quick Start

### Start Mobile Dev Server in Docker
```bash
# From workspace root
docker-compose up mobile-dev
```

The Expo dev server will be accessible at:
- **Web app**: http://localhost:8081
- **Expo DevTools**: http://localhost:19002
- **Metro bundler**: http://localhost:8081

### Access Your App

#### Option 1: Web Browser (Fastest for Testing)
```bash
docker-compose up mobile-dev
# Opens automatically at http://localhost:8081
# Or visit http://localhost:19002 for DevTools
```

#### Option 2: Android Emulator
1. Start Android Studio emulator on Windows
2. In the container terminal, press `a` to open on Android
3. Or run:
```bash
docker-compose run mobile-dev npm run dev:android
```

#### Option 3: iOS Simulator (macOS only)
1. Start iOS Simulator on macOS
2. In the container terminal, press `i` to open on iOS
3. Or run:
```bash
docker-compose run mobile-dev npm run dev:ios
```

## Usage Commands

### Start Dev Server
```bash
docker-compose up mobile-dev
```

### Stop Dev Server
```bash
docker-compose down
```

### Rebuild Container (After Dependency Changes)
```bash
docker-compose build mobile-dev
docker-compose up mobile-dev
```

### Run Commands Inside Container
```bash
# Shell access
docker-compose run mobile-dev sh

# Run specific npm script
docker-compose run mobile-dev npm run build:ios
```

### View Logs
```bash
docker-compose logs -f mobile-dev
```

## Troubleshooting

### Issue: "Cannot connect to Metro bundler"
**Solution**: Ensure ports are forwarded correctly
```bash
# Check if ports are exposed
docker ps
# Should show: 0.0.0.0:8081->8081/tcp, 0.0.0.0:19000->19000/tcp
```

### Issue: "QR code not scanning"
**Solution**: Use tunnel mode
```bash
docker-compose run mobile-dev npm run dev:tunnel
```

### Issue: "npm install fails"
**Solution**: Clear volumes and rebuild
```bash
docker-compose down -v
docker-compose build --no-cache mobile-dev
docker-compose up mobile-dev
```

### Issue: "Changes not reflecting"
**Solution**: Ensure volume mounts are correct
```bash
# Verify mounts
docker-compose config
# Should show workspace root mounted to /workspace
```

## File Sync

Docker Desktop (via Rancher Desktop) uses bind mounts, so file changes on Windows are immediately reflected in the container. Hot reload should work automatically.

## Performance Tips

1. **Use named volumes for node_modules**: Already configured in docker-compose.yml
2. **Disable Windows Defender scanning for workspace**: Speeds up file watching
3. **Use SSD**: Docker Desktop performs better on SSDs

## Production Builds

For production builds, you can still use EAS Build directly on Windows (no Docker needed):
```bash
# From workspace root (Windows)
npm run build:mobile:ios
npm run build:mobile:android
```

EAS Build runs in the cloud, so Windows path issues don't apply.

## Development Workflow

```bash
# Terminal 1: Start Docker dev server
docker-compose up mobile-dev

# Browser: Opens at http://localhost:8081
# Your React Native app runs in the browser for quick testing

# Terminal 2 (on Windows): Edit code
# Changes are automatically synced and hot-reloaded

# Terminal 3 (optional): Run tests
npm run test:web
```

## Testing on Different Platforms

### Web (Recommended for Development)
- Automatically opens at http://localhost:8081
- Fastest hot reload
- Full React DevTools support
- Great for UI development

### Android Emulator
Requires Android Studio with emulator:
```bash
# Start emulator on Windows first
# Then in container, press 'a' or run:
docker-compose exec mobile-dev npm run dev:android
```

### Physical Device (Advanced)
Use adb over network:
```bash
# Connect device to same network
# Enable USB debugging and wireless debugging
adb connect <device-ip>:5555
docker-compose exec mobile-dev npm run dev:android
```

## Stopping Services

```bash
# Stop but keep containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clean slate)
docker-compose down -v
```

## Environment Variables

To add environment variables, create a `.env` file in the workspace root:
```bash
EXPO_DEBUG=true
REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal
```

Then reference in docker-compose.yml:
```yaml
env_file:
  - .env
```

---

**Next Steps**: 
1. Start Rancher Desktop
2. Run `docker-compose up mobile-dev`
3. Scan QR code with Expo Go
4. Start developing!
