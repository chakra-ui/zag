# Zag.js AI Agent Instructions

## Documentation

For detailed information on specific topics, see:

- `@.claude/docs/commands.md` - All available commands and workflows
- `@.claude/docs/architecture.md` - Code organization and structure
- `@.claude/docs/guidelines.md` - Development guidelines and best practices
- `@.claude/docs/common-tasks.md` - Step-by-step guides for common tasks
- `@.claude/docs/troubleshooting.md` - Debugging and problem-solving
- `@.claude/docs/state-machine-guide.md` - State machine patterns and implementation
- `@.claude/docs/framework-integration-guide.md` - Framework adapter development
- `@.claude/docs/playwright-testing-guide.md` - E2E testing with Playwright
- `@.claude/docs/documentation-structure-guide.md` - Documentation standards

## Project Overview

**Zag.js** is a framework-agnostic UI component library that implements common component patterns using state machines.
The library focuses on accessibility (following WAI-ARIA practices) and provides adapters for React, Solid, Svelte, Vue,
and Preact.

**Key Features:**

- Framework-agnostic state machines for UI components
- Built-in accessibility (ARIA roles, keyboard interactions, focus management)
- Headless API (no styling, full control over appearance)
- Comprehensive E2E testing with Playwright
- TypeScript-first development

## Development Environment

### Package Manager

- **pnpm** is the required package manager (version 10.15.0+)
- Use `pnpm` for all dependency management
- Avoid npm/yarn commands

### Node Version

- Node.js 18.0.0+ required
- Engine specified in root package.json

## Quick Reference

### Most Common Commands

```bash
pnpm build              # Build all packages
pnpm start-react        # Start React example
pnpm test               # Run all tests
pnpm e2e-react          # E2E tests for React
pnpm lint               # Lint all packages
pnpm typecheck          # TypeScript type checking
```

See `.claude/docs/commands.md` for the complete list.

## Core Principles

1. **Accessibility First**: All machines follow WAI-ARIA practices
2. **Framework Agnostic**: Core logic never depends on framework specifics
3. **TypeScript First**: Everything is typed
4. **E2E Testing**: All components have comprehensive Playwright tests
5. **Simple Machines**: Avoid complex nested states, spawn, etc.

## Contributing

1. Follow conventional commit format
2. Ensure all tests pass
3. Update documentation for API changes
4. Test accessibility thoroughly
5. Keep PRs focused on single features/components

Remember: Zag.js prioritizes accessibility, simplicity, and framework-agnostic design. Always consider how changes
affect all supported frameworks and ensure robust accessibility support.
