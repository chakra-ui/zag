# Zag.js AI Agent Instructions

## Project Overview
**Zag.js** is a framework-agnostic UI component library that implements common component patterns using state machines. The library focuses on accessibility (following WAI-ARIA practices) and provides adapters for React, Solid, Svelte, Vue, and Preact.

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

### Workspace Structure
This is a monorepo using pnpm workspaces:
```
packages/
├── machines/          # State machines for components (accordion, dialog, etc.)
├── frameworks/        # Framework adapters (react, vue, solid, svelte, preact)
├── utilities/         # Shared utilities (dom-query, popper, focus-trap, etc.)
├── core/             # Core machine functionality
├── anatomy/          # Component anatomy definitions
├── anatomy-icons/    # Icon components for anatomy
├── store/            # State management utilities
├── types/            # Shared TypeScript types
└── docs/             # Documentation generation
```

## Key Commands & Workflows

### Building
```bash
pnpm build              # Build all packages
pnpm packages -- build  # Build specific packages
pnpm clean-pkgs         # Clean all package builds
```

### Development Servers
```bash
pnpm start-react        # Next.js example (React)
pnpm start-vue          # Nuxt.js example (Vue)
pnpm start-solid        # Solid.js example
pnpm start-svelte       # Svelte example
pnpm start-website      # Documentation website
```

### Testing
```bash
pnpm test               # Run all tests
pnpm test-js            # Run JavaScript tests (utilities, core)
pnpm test-react         # Run React-specific tests
pnpm test-vue           # Run Vue-specific tests
pnpm test-solid         # Run Solid-specific tests
pnpm test-svelte        # Run Svelte-specific tests
```

### E2E Testing
```bash
pnpm e2e-react          # E2E tests for React
pnpm e2e-vue            # E2E tests for Vue
pnpm e2e-solid          # E2E tests for Solid
pnpm pw-report          # View Playwright test reports
```

### Code Quality
```bash
pnpm lint               # Lint all packages
pnpm prettier           # Check formatting
pnpm prettier-fix       # Fix formatting
pnpm typecheck          # TypeScript type checking
```

### Code Generation
```bash
pnpm generate-machine   # Generate new component machine
pnpm generate-util      # Generate new utility package
pnpm sync-pkgs          # Sync package dependencies
```

## Code Organization Patterns

### Machine Structure
Each machine package follows this structure:
```
packages/machines/{component}/
├── src/
│   ├── {component}.machine.ts    # State machine definition
│   ├── {component}.connect.ts    # Framework connection API
│   ├── {component}.types.ts      # TypeScript types
│   ├── {component}.anatomy.ts    # Component anatomy
│   ├── {component}.dom.ts        # DOM utilities
│   └── index.ts                  # Main exports
├── package.json
├── README.md
└── tsconfig.json
```

### Framework Adapters
Each framework adapter provides:
- Machine consumption utilities
- Props normalization
- Framework-specific optimizations
- TypeScript integration

### Utility Packages
Utilities are organized by functionality:
- `dom-query`: DOM manipulation and querying
- `popper`: Positioning and floating elements
- `focus-trap`: Focus management
- `interact-outside`: Click outside detection
- `dismissable`: Dismissal patterns

## Development Guidelines

### State Machine Patterns
1. **Simple Machines**: Avoid complex nested states, spawn, etc.
2. **Accessibility First**: All machines follow WAI-ARIA practices
3. **Framework Agnostic**: Core logic never depends on framework specifics
4. **Event-Driven**: Use events for state transitions, not direct mutations

### Code Style
1. **TypeScript First**: Everything is typed
2. **Functional Programming**: Prefer pure functions and immutability
3. **Consistent Naming**: Use camelCase for properties, PascalCase for types
4. **Small Functions**: Break down complex logic into smaller, testable functions

### Testing Strategy
1. **E2E First**: All components have Playwright E2E tests
2. **Framework Coverage**: Test same behavior across all supported frameworks
3. **Accessibility Testing**: Verify ARIA attributes and keyboard interactions
4. **Cross-Browser**: Ensure consistent behavior across browsers

## Common Tasks

### Adding a New Component
1. Use `pnpm generate-machine` to scaffold the package structure
2. Implement the state machine in `{component}.machine.ts`
3. Add framework connections in `{component}.connect.ts`
4. Create E2E tests in `e2e/{component}.e2e.ts`
5. Update documentation and examples
6. Run `pnpm sync-pkgs` to update dependencies

### Modifying Existing Components
1. Update the state machine definition
2. Test across all frameworks
3. Update E2E tests if behavior changes
4. Ensure accessibility compliance
5. Update TypeScript types

### Framework-Specific Changes
1. Modify the framework adapter in `packages/frameworks/{framework}/`
2. Test the specific framework thoroughly
3. Ensure no breaking changes to the API
4. Update framework-specific examples

### Adding Utilities
1. Use `pnpm generate-util` for scaffolding
2. Place in appropriate category under `packages/utilities/`
3. Ensure TypeScript types are exported
4. Add unit tests
5. Update documentation

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

## Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Test Failures**: Verify E2E test setup and browser compatibility
3. **Framework Issues**: Check framework adapter implementation
4. **Type Errors**: Ensure proper type exports and imports

### Debugging Tips
1. Use framework examples for testing changes
2. Check E2E test results for cross-framework issues
3. Verify accessibility with screen readers and keyboard navigation
4. Test in multiple browsers

## Contributing
1. Follow conventional commit format
2. Ensure all tests pass
3. Update documentation for API changes
4. Test accessibility thoroughly
5. Keep PRs focused on single features/components

Remember: Zag.js prioritizes accessibility, simplicity, and framework-agnostic design. Always consider how changes affect all supported frameworks and ensure robust accessibility support.
