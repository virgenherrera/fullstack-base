# fullstack-base

Fullstack monorepo template: NestJS + Angular + Zod API contract.

## Stack

| Layer        | Technology           |
| ------------ | -------------------- |
| Backend      | NestJS 11            |
| Frontend     | Angular 22           |
| Validation   | Zod 4                |
| Language     | TypeScript 6         |
| Workspaces   | pnpm workspaces      |

## Prerequisites

| Requirement | Version        |
| ----------- | -------------- |
| Node.js     | >= 24.13.0     |
| pnpm        | >= 11.0.0      |

Both constraints are enforced via the `engines` field in `package.json` with `engine-strict=true`.

## Quick Start

```bash
pnpm install
pnpm run test                              # full pipeline
pnpm --filter @base/api run start:dev      # API dev server
pnpm --filter @base/web run start          # Angular dev server
```

## Project Structure

```
fullstack-base/
├── apps/
│   ├── api/          — NestJS HTTP API
│   └── web/          — Angular prerendered frontend
├── packages/
│   └── api-contract/ — Shared Zod schemas (source of truth)
├── quality/
│   ├── api/          — API E2E tests (Jest + supertest)
│   └── web/          — Web E2E tests (Playwright)
└── artifacts/        — Build outputs (gitignored)
```

## Scripts

All root-level scripts are defined in [`package.json`](package.json). They delegate to workspaces via `pnpm -r run --if-present <name>`.

| Script              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `test`              | Full pipeline: cleanup, build, static, types, dynamic    |
| `test:static`       | ESLint + Prettier across all workspaces                  |
| `test:types`        | TypeScript type checking across all workspaces           |
| `test:unit`         | Unit tests across all workspaces                         |
| `test:e2e`          | E2E tests across all workspaces                          |
| `test:dynamic`      | Unit + E2E combined                                      |
| `test:doctor`       | Dependency health check (runs after cleanup)             |
| `build`             | Build all workspaces                                     |
| `cleanup`           | Remove build artifacts and workspace outputs             |
| `bumpDependencies`  | Security fix + interactive dependency upgrade            |
| `securityCheck`     | `pnpm audit --audit-level high`                          |
| `securityFix`       | `pnpm update` (resolves known vulnerabilities)           |
| `updatePnpm`        | Update pnpm via corepack                                 |

## Architecture

The `api-contract` package is the single source of truth for all shared types and validation schemas. Both the API and the web frontend depend on it. Every endpoint request/response shape is defined as a Zod schema in `api-contract`, and TypeScript types are inferred from those schemas. This guarantees that backend and frontend always agree on the data contract at compile time.

```
api-contract (Zod schemas)
    ├── api (NestJS — validates at runtime)
    └── web (Angular — validates at compile time)
```

## DX Features

- **Engine strictness**: `engines` field enforces exact Node.js and pnpm versions. No version drift across contributors.
- **Exact dependencies via catalog**: all shared dependency versions are declared in `pnpm-workspace.yaml` under `catalog:`. Workspaces reference `catalog:` instead of pinning versions individually.
- **Supply chain security**: `minimumReleaseAge: 1440` blocks packages published less than 24 hours ago, covering the most common attack vector for malicious package hijacking.
- **Doctor mode**: `pnpm run test:doctor` runs a health check after dependency bumps to catch breakage early.
- **Allow builds policy**: `allowBuilds` in `pnpm-workspace.yaml` explicitly documents which packages are trusted to run postinstall scripts. Untrusted packages are blocked by default.

## CI

This template includes a CI-only pipeline (no CD). The CI workflow runs on every pull request targeting `master`:

1. Static analysis (`test:static`) and type checking (`test:types`) always run
2. Unit tests and builds run conditionally based on path filters
3. E2E tests run after a successful build

Template users define their own CD pipeline based on their deployment target. The CI workflow is designed to be extended, not replaced.

## License

UNLICENSED. This is a template repository. Update the license field in `package.json` when forking for your own project.
