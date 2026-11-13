import { test, expect } from '@playwright/test';

test('landing page has its title, content, and health link', async ({ page }) => {
  const response = await page.goto('/');

  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle('Go Template');
  await expect(page.getByRole('heading', { level: 1, name: 'Go Template' })).toBeVisible();
  await expect(page.getByText('Your new project starts here.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Service health' })).toHaveAttribute('href', '/healthz');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('health link works with keyboard navigation', async ({ page }) => {
  await page.goto('/');

  const healthLink = page.getByRole('link', { name: 'Service health' });
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Greet' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(healthLink).toBeFocused();
  await Promise.all([
    page.waitForURL('**/healthz'),
    page.keyboard.press('Enter'),
  ]);

  await expect(page.locator('body')).toContainText('"status":"ok"');
});

test('htmx updates the greeting without navigating or contacting a CDN', async ({ page }) => {
  const external = [];
  const errors = [];
  page.on('request', request => {
    if (new URL(request.url()).hostname !== '127.0.0.1') external.push(request.url());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.htmx?.config.allowEval)).toBe(false);
  const document = await page.evaluateHandle(() => window.document);
  await page.getByLabel('Name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Greet' }).click();
  await expect(page.getByRole('status')).toHaveText('Hello, Ada.');
  expect(await page.evaluate(previous => previous === window.document, document)).toBe(true);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('HTML-like input stays text', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Name', { exact: true }).fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Greet' }).click();
  await expect(page.getByRole('status')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.getByRole('status').locator('img')).toHaveCount(0);
});

test('request failures are visible and recoverable', async ({ page }) => {
  await page.goto('/');
  await page.route('**/?name=*', route => route.fulfill({ status: 500, body: 'failure' }));
  await page.getByLabel('Name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Greet' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Hello, world.');
  await page.unroute('**/?name=*');
  await page.getByRole('button', { name: 'Greet' }).click();
  await expect(page.getByRole('status')).toHaveText('Hello, Ada.');
  await expect(page.getByRole('alert')).toBeHidden();
});

test('form still works without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await page.getByLabel('Name', { exact: true }).fill('Grace');
    await page.getByRole('button', { name: 'Greet' }).click();
    await expect(page.getByRole('status')).toHaveText('Hello, Grace.');
  } finally {
    await context.close();
  }
});