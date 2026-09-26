import { test, expect } from '@playwright/test';
async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('E2e-only-password-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/app');
}
test('customer books, views receipt, cancels and reorders', async ({ page }) => {
  await login(page, 'customer@hydrohitch.test');
  await expect(page.getByRole('heading', { name: 'Hello, Ayesha.' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/customer-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Book a tanker', exact: true }).first().click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /2,000 L/ }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  await page.getByLabel('Delivery date').fill(date);
  await page.getByLabel('Delivery instructions (optional)').fill('Please call at the gate.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Your full price is calculated before confirmation.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Confirm booking' }).click();
  await expect(page.getByRole('heading', { name: 'A full tank is on the way.' })).toBeVisible();
  await page.getByRole('button', { name: 'View your booking' }).click();
  await expect(page.getByRole('heading', { name: 'Delivery journey' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print receipt' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel booking' }).click();
  await page.getByLabel('Reason / verification note').fill('Schedule changed');
  await page.getByRole('button', { name: 'Confirm update' }).click();
  await expect(page.getByText('Your update has been saved.')).toBeVisible();
  await page.getByRole('link', { name: 'Book again' }).click();
  await expect(page.getByRole('heading', { name: 'Let’s fill that tank.' })).toBeVisible();
});
test('admin can manage resources and support; driver access is scoped', async ({ page }) => {
  await login(page, 'admin@hydrohitch.test');
  await page.getByRole('link', { name: 'Fleet & drivers', exact: true }).click();
  await expect(page.getByText('HH-1024')).toBeVisible();
  await page.getByRole('button', { name: 'Add tanker' }).click();
  await page.getByLabel('Registration number').fill('E2E-9000');
  await page.getByLabel('Capacity (litres)').fill('5000');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('E2E-9000')).toBeVisible();
  await page.getByRole('link', { name: 'Reports', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bookings by status' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/admin-reports.png', fullPage: true });
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await login(page, 'driver@hydrohitch.test');
  await expect(page.getByRole('heading', { name: 'Ready for the road.' })).toBeVisible();
  await page.goto('/app/settings');
  await expect(page.getByRole('heading', { name: 'Access restricted' })).toBeVisible();
});
test('320px customer layout has no horizontal overflow and supports mobile navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await login(page, 'customer@hydrohitch.test');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.screenshot({ path: 'docs/screenshots/customer-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Saved addresses' }).click();
  await expect(page.getByRole('heading', { name: 'Saved addresses' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});
test('registration, profile editing, support and notifications work', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Full name').fill('Browser Customer');
  await page.getByLabel('Phone number').fill('+923001234567');
  await page.getByLabel('Email address').fill('browser@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Browser-test-password-2026');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Hello, Browser.' })).toBeVisible();
  await page.getByRole('link', { name: 'Your profile', exact: true }).click();
  await page.getByLabel('Full name').fill('Browser Updated');
  await page.context().setOffline(true);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByText('Unable to connect. Check your connection and try again.'),
  ).toBeVisible();
  await page.context().setOffline(false);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Profile updated.')).toBeVisible();
  await page.getByRole('link', { name: 'Help & support', exact: true }).click();
  await page.getByRole('button', { name: 'New support request' }).click();
  await page.getByLabel('Subject').fill('Water quality question');
  await page.getByLabel('Message').fill('Please share the current water source details.');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('heading', { name: 'Water quality question' })).toBeVisible();
  await page.getByRole('link', { name: 'Notifications', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Welcome to Hydro-Hitch' })).toBeVisible();
});
