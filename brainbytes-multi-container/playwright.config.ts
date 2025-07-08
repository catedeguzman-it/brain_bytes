// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  use: {
    baseURL: 'http://localhost:4001',
    headless: true,
    trace: 'on-first-retry',
  },
});
