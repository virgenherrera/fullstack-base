import { defineConfig, devices } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

type PlaywrightConfig = Parameters<typeof defineConfig>[0];

const WEB_SERVER_TIMEOUT = 10_000;

function envSchema(configDir: string) {
  const defaultArtifactsDir = resolve(configDir, '../../artifacts/web/browser');
  const qualityArtifactsDir = resolve(configDir, '../../artifacts/quality/web');
  const reportDir = resolve(qualityArtifactsDir, 'playwright-report');
  const outputDir = resolve(qualityArtifactsDir, 'test-results');

  return z
    .object({
      CI: z
        .string()
        .optional()
        .transform((value) => !!value),
      PW_PORT: z.coerce.number().int().positive().default(4200),
      PW_ARTIFACTS_DIR: z
        .string()
        .default(defaultArtifactsDir)
        .refine((dir) => existsSync(dir), {
          message:
            'Build artifacts directory not found.\nRun: pnpm --filter @base/web build',
        })
        .transform((dir) => ({ dir, entries: readdirSync(dir) }))
        .refine(({ entries }) => entries.includes('index.html'), {
          message:
            'Missing index.html — build required.\nRun: pnpm --filter @base/web build',
        })
        .transform(({ dir }) => dir),
    })
    .transform((raw): PlaywrightConfig => {
      const baseUrl = `http://localhost:${raw.PW_PORT}`;

      return {
        testDir: './src/tests',
        outputDir,
        fullyParallel: true,
        forbidOnly: raw.CI,
        retries: raw.CI ? 2 : 0,
        workers: raw.CI ? 1 : undefined,
        reporter: raw.CI
          ? [['github'], ['html', { outputFolder: reportDir, open: 'never' }]]
          : [['html', { outputFolder: reportDir, open: 'on-failure' }]],
        use: {
          baseURL: baseUrl,
          trace: 'on-first-retry',
          screenshot: 'only-on-failure',
          viewport: { width: 1280, height: 720 },
        },
        webServer: {
          command: `pnpm exec http-server ${raw.PW_ARTIFACTS_DIR} --port ${raw.PW_PORT} --silent --cors -c-1`,
          url: baseUrl,
          reuseExistingServer: !raw.CI,
          timeout: WEB_SERVER_TIMEOUT,
        },
        projects: [
          {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
          },
        ],
      };
    });
}

export function parsePlaywrightEnv(configDir: string): PlaywrightConfig {
  return envSchema(configDir).parse(process.env);
}

export default defineConfig(parsePlaywrightEnv(import.meta.dirname));
