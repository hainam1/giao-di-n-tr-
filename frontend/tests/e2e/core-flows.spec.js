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
  await expect(page).toHaveURL(/admin\.html$/);
  await expect(page.locator('#viewOverview')).toBeVisible();
  await expect(page.locator('#navOrders')).toBeVisible();

  await page.goto('/mobile.html');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.mobile-content')).toBeVisible();

  expect(pageErrors).toEqual([]);
});
