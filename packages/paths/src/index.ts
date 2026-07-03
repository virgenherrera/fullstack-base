import { resolve } from 'node:path';

// Works from both src/ and dist/ — same depth: packages/paths/{src|dist}/index.{ts|js}
// Three levels up: {src|dist} → paths → packages → REPO_ROOT
export const REPO_ROOT = resolve(__dirname, '..', '..', '..');
export const ARTIFACTS_WEB = resolve(REPO_ROOT, 'artifacts', 'web', 'browser');
export const ARTIFACTS_API = resolve(
  REPO_ROOT,
  'apps',
  'api',
  'artifacts',
  'dist',
);
