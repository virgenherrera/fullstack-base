import { test, expect } from '@playwright/test';

test.describe('Health Semaphore', () => {
  test('should render the health component with data-status attribute', async ({
    page,
  }) => {
    await page.goto('/');

    // The prerendered page has the semaphore in "loading" state.
    // Without a running API, afterNextRender fires and the HTTP call fails,
    // transitioning the semaphore to "error". Both are valid render states.
    const semaphore = page.locator('[data-status]');
    await expect(semaphore).toBeVisible({ timeout: 5000 });

    const status = await semaphore.getAttribute('data-status');
    expect(['loading', 'error']).toContain(status);
  });

  test('should display the Fullstack Base heading', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toHaveText('Fullstack Base');
  });

  test('should include health status text', async ({ page }) => {
    await page.goto('/');

    // Prerendered content shows "Checking API health..." or after hydration
    // with no API: "API is unreachable"
    const details = page.locator('[data-status] .details p:first-child');
    await expect(details).toBeVisible({ timeout: 5000 });

    const text = await details.textContent();
    expect(text).toMatch(
      /Checking API health|API is unreachable|API is healthy/,
    );
  });
});
