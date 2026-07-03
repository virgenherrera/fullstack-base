import { resolve } from 'node:path';

// Works from both src/ and dist/ — same depth: packages/paths/{src|dist}/index.{ts|js}
// Three levels up: {src|dist} → paths → packages → REPO_ROOT
export const REPO_ROOT = resolve(__dirname, '..', '..', '..');
export const ARTIFACTS = resolve(REPO_ROOT, 'artifacts');
export const ARTIFACTS_WEB = resolve(ARTIFACTS, 'web', 'browser');
export const ARTIFACTS_API = resolve(
  REPO_ROOT,
  'apps',
  'api',
  'artifacts',
  'dist',
);
export const ARTIFACTS_QUALITY_WEB = resolve(ARTIFACTS, 'quality', 'web');
export const ARTIFACTS_QUALITY_WEB_REPORT = resolve(
  ARTIFACTS_QUALITY_WEB,
  'playwright-report',
);
export const ARTIFACTS_QUALITY_WEB_RESULTS = resolve(
  ARTIFACTS_QUALITY_WEB,
  'test-results',
);
