import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('landing, authentication and customer workspace meet automated WCAG AA checks', async ({
  page,
}) => {
  for (const path of ['/', '/login']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
  await page.getByLabel('Email address').fill('customer@hydrohitch.test');
  await page.getByLabel('Password', { exact: true }).fill('E2e-only-password-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/app');
  await expect(page.getByRole('heading', { name: 'Recent bookings' })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});
