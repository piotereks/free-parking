import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173/free-parking/',
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'VITE_BASE_PATH=/free-parking/ npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/free-parking/',
    reuseExistingServer: true,
    timeout: 60_000
  }
});
