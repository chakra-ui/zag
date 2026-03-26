# Code Organization & Architecture

## Workspace Structure

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

## Machine Structure

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

## Framework Adapters

Each framework adapter provides:

- Machine consumption utilities
- Props normalization
- Framework-specific optimizations
- TypeScript integration

## Utility Packages

Utilities are organized by functionality:

- `dom-query`: DOM manipulation and querying
- `popper`: Positioning and floating elements
- `focus-trap`: Focus management
- `interact-outside`: Click outside detection
- `dismissable`: Dismissal patterns
