import { expect } from '@playwright/test';
import { test } from '../fixtures/health.fixture.js';

test.describe('Health Semaphore', () => {
  test.describe('semaphore element', () => {
    test('should render with a data-status attribute', async ({
      healthPage,
    }) => {
      // Arrange
      await healthPage.goto();

      // Act
      // The prerendered page has the semaphore in "loading" state.
      // After hydration the semaphore transitions to "ok" (API healthy),
      // "error" (API unreachable), or stays "loading". All are valid.
      const status = await healthPage.semaphore.getAttribute('data-status');

      // Assert
      await expect(healthPage.semaphore).toBeVisible({ timeout: 5000 });
      expect(['loading', 'error', 'ok']).toContain(status);
    });
  });

  test.describe('heading', () => {
    test('should display the Fullstack Base heading', async ({
      healthPage,
    }) => {
      // Arrange & Act
      await healthPage.goto();

      // Assert
      await expect(healthPage.heading).toHaveText('Fullstack Base');
    });
  });

  test.describe('status details', () => {
    test('should include health status text', async ({ healthPage }) => {
      // Arrange & Act
      await healthPage.goto();

      // Assert
      // Prerendered content shows "Checking API health..." or after hydration
      // with no API: "API is unreachable"
      await expect(healthPage.statusDetails).toBeVisible({ timeout: 5000 });
      const text = await healthPage.statusDetails.textContent();
      expect(text).toMatch(
        /Checking API health|API is unreachable|API is healthy/,
      );
    });
  });
});
