// TECH DEBT: Node 24 type-stripping loads .ts files directly, detects
// `export from` as ESM, and requires explicit extensions — but .ts extensions
// break consumer tsc and .js extensions don't resolve to .ts source files.
// Workaround: api-contract compiles to dist/ so Node loads CJS .js output
// where extensionless resolution works. When Node stabilizes CTS (CommonJS
// TypeScript) module detection, this package can revert to source-only.
// Ref: https://nodejs.org/api/typescript.html#type-stripping
export {
  HealthQuerySchema,
  HealthResponseSchema,
  type HealthQuery,
  type HealthResponse,
} from './health';
