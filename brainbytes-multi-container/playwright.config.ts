// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  use: {
    baseURL: 'https://brainbytes-frontend-zk1e.onrender.com',
    headless: true,
    trace: 'on-first-retry',
  },
});
