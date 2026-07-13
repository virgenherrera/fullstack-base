# @base/paths

Centralized repository path constants. Resolves all shared directory paths from a single source of truth, eliminating scattered `resolve(__dirname, '../../...')` calls across packages.

See [Artifact Dependency Graph](../../docs/quality-gates.md#artifact-dependency-graph) for the system that defines how these paths are consumed in CI and locally.

## Exported Constants

| Constant                        | Resolved Path                              | Consumer                              |
| ------------------------------- | ------------------------------------------ | ------------------------------------- |
| `REPO_ROOT`                     | `/` (repository root)                      | All packages                          |
| `ARTIFACTS`                     | `artifacts/`                               | Derived constants                     |
| `ARTIFACTS_WEB`                 | `artifacts/web/browser/`                   | Playwright e2e (build validation)     |
| `ARTIFACTS_API`                 | `apps/api/artifacts/dist/`                 | Playwright webServer (see note below) |
| `ARTIFACTS_API_DOCS`            | `artifacts/api-docs/`                      | OpenAPI build script                  |
| `ARTIFACTS_QUALITY_WEB`         | `artifacts/quality/web/`                   | quality/web cleanup script            |
| `ARTIFACTS_QUALITY_WEB_REPORT`  | `artifacts/quality/web/playwright-report/` | Playwright HTML reporter              |
| `ARTIFACTS_QUALITY_WEB_RESULTS` | `artifacts/quality/web/test-results/`      | Playwright test output                |

> **Why `ARTIFACTS_API` is not under `artifacts/`**: NestJS produces distributed `.js` files that
> require `node_modules` at runtime via Node.js module resolution. With pnpm strict mode,
> dependencies resolve from `apps/api/node_modules` — only accessible when the script runs from
> within `apps/api/`. Static outputs like OpenAPI docs have no such constraint.

## Usage

```typescript
import {
  ARTIFACTS_QUALITY_WEB_REPORT,
  ARTIFACTS_QUALITY_WEB_RESULTS,
} from '@base/paths';

// Use directly — no manual resolve() needed
console.log(ARTIFACTS_QUALITY_WEB_REPORT);
// → /absolute/path/to/repo/artifacts/quality/web/playwright-report
```
