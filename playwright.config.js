import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/e2e-server.mjs',
    url: 'http://localhost:5174/api/v2/catalog',
    timeout: 120000,
    reuseExistingServer: false,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
