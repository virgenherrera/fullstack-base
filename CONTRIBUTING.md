# Contributing to fullstack-base

## Using as Template

Fork this repository and customize it for your project.

### 1. Fork and clone

```bash
git clone https://github.com/<your-org>/fullstack-base.git
cd fullstack-base
pnpm install
```

### 2. Update package metadata

In `package.json` (root), update:

- `name` -- your project name
- `author` -- your name and URL
- `homepage` -- your repository URL
- `bugs.url` -- your issues URL
- `repository.url` -- your git URL
- `contributors` -- your team

### 3. Update workspace scope

The default workspace scope is `@base/`. To use your own scope:

1. Rename `name` fields in each workspace `package.json` (e.g., `@base/api` to `@myorg/api`)
2. Update cross-workspace dependency references to match the new scope
3. Update root `package.json` scripts that reference `--filter @base/*`

### 4. Update catalog versions

Review `pnpm-workspace.yaml` and update the `catalog:` section with your preferred dependency versions. The catalog is the single source of truth for shared dependency versions across all workspaces.

## Development

### Prerequisites

| Requirement | Version    |
| ----------- | ---------- |
| Node.js     | >= 24.13.0 |
| pnpm        | >= 11.0.0  |

### Install dependencies

```bash
pnpm install
```

### Run tests

```bash
pnpm run test
```

This runs the full pipeline: cleanup, build, static analysis, type checking, unit tests, and E2E tests.

## Branch Model

All changes follow the branching model defined in [AGENTS.md](AGENTS.md):

```
task/{name} -> feature/{epic} -> PR to master
```

- **Task branches** (`task/{descriptive-name}`): one per unit of work. The smallest branch unit.
- **Epic branches** (`feature/{epic-name}`): collect all task merges for a feature.
- **Integration**: squash-merge from the epic branch to `master` via pull request.

There is no "too small" exemption. A one-line fix follows the same model as a multi-file feature.

## Quality Gates

All quality gates must pass before a pull request can be merged.

### Static analysis

```bash
pnpm run test:static
```

Runs ESLint and Prettier checks across all workspaces.

### Type checking

```bash
pnpm run test:types
```

Runs TypeScript type checking across all workspaces.

### Dynamic tests

```bash
pnpm run test:dynamic
```

Runs unit tests (`test:unit`) and E2E tests (`test:e2e`) across all workspaces.

### Full pipeline

```bash
pnpm run test
```

Runs all gates in order: cleanup, build, static, types, dynamic. This is the same pipeline that CI runs.

## Commit Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) as defined in [AGENTS.md](AGENTS.md).

### Format

```text
<type>: Title

Brief description.

- Action item 1.
- Action item n.
```

### Types

| Type    | When to use                       |
| ------- | --------------------------------- |
| `feat`  | New features or capabilities      |
| `fix`   | Bug fixes                         |
| `chore` | Tooling, config, dependencies, CI |
| `task`  | Changes to existing functionality |
| `spike` | Research or exploration           |

### Rules

- Subject line: imperative mood, lowercase, no trailing period, max 72 characters
- Body: brief description followed by bullet points listing each concrete change
- No `Co-Authored-By` lines or AI attribution
