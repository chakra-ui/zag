# Key Commands & Workflows

## Building

```bash
pnpm build              # Build all packages
pnpm packages -- build  # Build specific packages
pnpm clean-pkgs         # Clean all package builds
```

## Development Servers

```bash
pnpm start-react        # Next.js example (React)
pnpm start-vue          # Nuxt.js example (Vue)
pnpm start-solid        # Solid.js example
pnpm start-svelte       # Svelte example
pnpm start-website      # Documentation website
```

## Testing

```bash
pnpm test               # Run all tests
pnpm test-js            # Run JavaScript tests (utilities, core)
pnpm test-react         # Run React-specific tests
pnpm test-vue           # Run Vue-specific tests
pnpm test-solid         # Run Solid-specific tests
pnpm test-svelte        # Run Svelte-specific tests
```

## E2E Testing

```bash
pnpm e2e-react          # E2E tests for React
pnpm e2e-vue            # E2E tests for Vue
pnpm e2e-solid          # E2E tests for Solid
pnpm pw-report          # View Playwright test reports
```

## Code Quality

```bash
pnpm lint               # Lint all packages
pnpm prettier           # Check formatting
pnpm prettier-fix       # Fix formatting
pnpm typecheck          # TypeScript type checking
```

## Code Generation

```bash
pnpm generate-machine   # Generate new component machine
pnpm generate-util      # Generate new utility package
pnpm sync-pkgs          # Sync package dependencies
```

## Creating Changesets

```bash
npx changeset           # Interactive changeset creation (may not work in all terminals)
# Or create manually in .changeset/descriptive-name.md with format:
# ---
# "@zag-js/package-name": patch|minor|major
# ---
# User-facing description of changes
```
