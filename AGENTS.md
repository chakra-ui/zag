# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Zag.js is a pnpm monorepo (~96 workspace packages) with no external service dependencies (no databases, Docker, APIs). All development is purely frontend/library work.

### Key commands

See `CLAUDE.md` and `.claude/docs/commands.md` for the full reference. Summary:

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Build all packages | `pnpm build` |
| Lint | `pnpm lint` |
| Unit tests (JS/core) | `pnpm test-js --run` |
| Unit tests (React) | `pnpm test-react --run` |
| Unit tests (all) | `pnpm test` |
| Start React dev server | `pnpm start-react` (port 3000) |
| E2E tests (React) | `pnpm e2e-react` |
| Typecheck | `pnpm typecheck` |

### Non-obvious caveats

- **Always browser-test new examples**: When you add or modify an example under `examples/next-ts/pages/**`, drive a real browser (Playwright MCP, Chrome DevTools MCP, or equivalent) and step through the example before reporting it as done. Visually verify the layout, typing flow, and any locale/timezone-specific output. E2E tests are a strong complement but not a substitute — they cover behavior, not rendering. If browser tooling is unavailable in the current session, say so explicitly rather than implying visual verification.
- **Build before dev server**: `pnpm build` must complete before running any example dev servers or E2E tests, since workspace packages use `workspace:*` references and need compiled `dist/` output.
- **Build is slow**: The full `pnpm build` takes ~2 minutes across all packages. It only needs to run once unless package source changes.
- **Node version**: `.nvmrc` specifies Node 24, but Node 22 (pre-installed) works fine. The engine constraint is `>=18.0.0`.
- **pnpm version**: `packageManager` field specifies `pnpm@10.33.0`. Corepack or the pre-installed pnpm handles this.
- **Husky hooks**: Pre-commit runs `lint-staged` (prettier on changed files). Commit-msg runs `commitlint` enforcing conventional commits. Both are non-blocking for development.
- **E2E tests**: Playwright auto-starts the appropriate dev server. Set `FRAMEWORK` env var to target a specific framework (default: `react`). Playwright browsers must be installed first via `pnpm exec playwright install`.
- **No secrets required**: No environment variables, API keys, or external services are needed for development.
