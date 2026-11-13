import { test, expect } from '@playwright/test';

test('health endpoint returns JSON liveness and security headers', async ({ request }) => {
  const response = await request.get('/healthz');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ status: 'ok' });
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['content-security-policy']).toBe(
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
});

test('HEAD preserves health metadata without a body', async ({ request }) => {
  const response = await request.head('/healthz');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.body()).toHaveLength(0);
});

test('unknown paths are not served the landing page', async ({ request }) => {
  const response = await request.get('/missing');

  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('404 page not found');
});

test('health endpoint rejects mutations', async ({ request }) => {
  const response = await request.post('/healthz');

  expect(response.status()).toBe(405);
  expect(response.headers().allow).toBe('GET, HEAD');
});

test('htmx receives escaped HTML fragments instead of full pages', async ({ request }) => {
  const response = await request.get('/', {
    params: { name: '<img src=x onerror=alert(1)>' },
    headers: { 'HX-Request': 'true' },
  });

  expect(response.status()).toBe(200);
  expect(response.headers().vary).toContain('HX-Request');
  const html = await response.text();
  expect(html).toContain('&lt;img');
  expect(html).not.toContain('<img');
  expect(html).not.toContain('<!doctype');
});

test('htmx is served locally', async ({ request }) => {
  const response = await request.get('/static/htmx.min.js');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('javascript');
  expect(await response.text()).toContain('htmx');
});