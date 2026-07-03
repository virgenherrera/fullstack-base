# @base/paths

Centralized repository path constants. Resolves all shared directory paths from a single source of truth, eliminating scattered `resolve(__dirname, '../../...')` calls across packages.

## Exported Constants

| Constant                        | Resolved Path                              | Consumer                          |
| ------------------------------- | ------------------------------------------ | --------------------------------- |
| `REPO_ROOT`                     | `/` (repository root)                      | All packages                      |
| `ARTIFACTS`                     | `artifacts/`                               | Derived constants                 |
| `ARTIFACTS_WEB`                 | `artifacts/web/browser/`                   | Playwright e2e (build validation) |
| `ARTIFACTS_API`                 | `apps/api/artifacts/dist/`                 | Playwright webServer              |
| `ARTIFACTS_QUALITY_WEB`         | `artifacts/quality/web/`                   | quality/web cleanup script        |
| `ARTIFACTS_QUALITY_WEB_REPORT`  | `artifacts/quality/web/playwright-report/` | Playwright HTML reporter          |
| `ARTIFACTS_QUALITY_WEB_RESULTS` | `artifacts/quality/web/test-results/`      | Playwright test output            |

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
