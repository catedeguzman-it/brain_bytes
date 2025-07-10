import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://brainbytes-frontend-zk1e.onrender.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
