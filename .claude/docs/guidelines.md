# Development Guidelines

## State Machine Patterns

1. **Simple Machines**: Avoid complex nested states, spawn, etc.
2. **Accessibility First**: All machines follow WAI-ARIA practices
3. **Framework Agnostic**: Core logic never depends on framework specifics
4. **Event-Driven**: Use events for state transitions, not direct mutations

## Code Style

1. **TypeScript First**: Everything is typed
2. **Functional Programming**: Prefer pure functions and immutability
3. **Consistent Naming**: Use camelCase for properties, PascalCase for types
4. **Small Functions**: Break down complex logic into smaller, testable functions

## Testing Strategy

1. **E2E First**: All components have Playwright E2E tests
2. **Framework Coverage**: Test same behavior across all supported frameworks
3. **Accessibility Testing**: Verify ARIA attributes and keyboard interactions
4. **Cross-Browser**: Ensure consistent behavior across browsers

## Quality Assurance

### Pre-Commit Hooks

- ESLint for code quality
- Prettier for formatting
- TypeScript type checking
- Commit message linting (conventional commits)

### CI/CD Pipeline

- Build verification across all packages
- Test execution (unit + E2E)
- Type checking
- Linting and formatting
- Package publishing automation
