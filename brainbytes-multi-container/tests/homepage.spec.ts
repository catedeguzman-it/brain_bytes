import { test, expect } from '@playwright/test';

test('homepage renders BrainBytes logo text', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h2')).toHaveText('BrainBytes');
});

test('log the page content', async ({ page }) => {
  await page.goto('/');
  const content = await page.content();
  console.log(content);
});