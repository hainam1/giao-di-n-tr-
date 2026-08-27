import { expect, test } from '@playwright/test';

const collectPageErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

test('customer can log in and open the storefront pages', async ({ page }) => {
  const pageErrors = collectPageErrors(page);

  await page.goto('/auth.html');
  await page.locator('#presetUserBtn').click();
  await page.locator('#btnLoginSubmit').click();
  await expect(page).toHaveURL(/index\.html$/);
  await expect(page.locator('#heroBanner')).toBeVisible();

  for (const path of ['/products.html', '/teaware.html', '/story.html', '/contact.html']) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/auth\.html$/);
  }

  expect(pageErrors).toEqual([]);
});

test('admin can log in and open desktop and mobile management', async ({ page }) => {
  const pageErrors = collectPageErrors(page);

  await page.goto('/auth.html');
  await page.locator('#presetAdminBtn').click();
  await page.locator('#btnLoginSubmit').click();
  await expect(page).toHaveURL(/admin\.html$/, { timeout: 15000 });
  await expect(page.locator('#viewOverview')).toBeVisible();
  await expect(page.locator('#navOrders')).toBeVisible();

  await page.goto('/mobile.html');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.mobile-content')).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('cart changes persist after reload and can be removed', async ({ page }) => {
  await page.goto('/auth.html');
  await page.locator('#presetUserBtn').click();
  await page.locator('#btnLoginSubmit').click();
  await expect(page).toHaveURL(/index\.html$/);

  await page.goto('/product-detail.html?id=1');
  await page.locator('#detailAddToCartBtn').click();
  await expect(page.locator('#cartCount')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#cartCount')).toHaveText('1');

  await page.locator('#cartBtn').click();
  await page.locator('.btn-cart-plus').click();
  await expect(page.locator('.cart-qty-val')).toHaveText('2');
  await page.locator('.btn-cart-minus').click();
  await expect(page.locator('.cart-qty-val')).toHaveText('1');
  await page.locator('.cart-item-remove').click();
  await expect(page.locator('#cartCount')).toHaveText('0');
});

test('login UI recovers when the backend returns HTTP 500', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Simulated server error' }) });
  });
  await page.goto('/auth.html');
  await page.locator('#presetUserBtn').click();
  await page.locator('#btnLoginSubmit').click();

  await expect(page.locator('#toastNotification')).toHaveClass(/show/);
  await expect(page.locator('#toastMessage')).toContainText('Simulated server error');
  await expect(page.locator('#btnLoginSubmit')).not.toHaveClass(/btn-loading/);
});

test('login UI recovers when the backend is unavailable', async ({ page }) => {
  await page.route('**/api/v1/auth/login', (route) => route.abort('connectionrefused'));
  await page.goto('/auth.html');
  await page.locator('#presetUserBtn').click();
  await page.locator('#btnLoginSubmit').click();

  await expect(page.locator('#toastNotification')).toHaveClass(/show/);
  await expect(page.locator('#toastMessage')).not.toBeEmpty();
  await expect(page.locator('#btnLoginSubmit')).not.toHaveClass(/btn-loading/);
});

test('admin product view handles an empty API response', async ({ page }) => {
  const pageErrors = collectPageErrors(page);
  await page.route('**/api/v1/admin/products*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.goto('/auth.html');
  await page.locator('#presetAdminBtn').click();
  await page.locator('#btnLoginSubmit').click();
  await expect(page).toHaveURL(/admin\.html$/, { timeout: 15000 });
  await page.locator('#navProducts').click();
  await expect(page.locator('#viewProducts')).toBeVisible();
  await expect(page.locator('#productsTableBody tr')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('two simultaneous checkout requests create only one order', async ({ request }) => {
  const login = await request.post('http://localhost:5000/api/v1/auth/login', {
    data: { email: 'khachhang@gmail.com', password: 'user123' },
  });
  expect(login.ok()).toBeTruthy();
  const token = (await login.json()).data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const products = await request.get('http://localhost:5000/api/v1/products');
  const catalog = (await products.json()).data;
  const product = catalog.find((item) => item.variants?.[0]?.inventory?.quantity > 1);
  expect(product).toBeTruthy();
  const variantId = product.variants[0].id;

  const cart = await request.put('http://localhost:5000/api/v1/cart', {
    headers,
    data: { items: [{ variantId, quantity: 1 }] },
  });
  expect(cart.ok()).toBeTruthy();

  const order = {
    customerName: 'Concurrent Checkout Test',
    customerEmail: 'khachhang@gmail.com',
    customerPhone: '0900000000',
    shippingAddress: '123 Tan Cuong',
    shippingProvince: 'Thai Nguyen',
    shippingFee: 30000,
    paymentMethod: 'COD',
  };
  const responses = await Promise.all([
    request.post('http://localhost:5000/api/v1/orders', { headers, data: order }),
    request.post('http://localhost:5000/api/v1/orders', { headers, data: order }),
  ]);
  const statuses = responses.map((response) => response.status()).sort();
  expect(statuses.filter((status) => status === 201)).toHaveLength(1);
  expect(statuses.filter((status) => status === 400 || status === 409)).toHaveLength(1);
});
