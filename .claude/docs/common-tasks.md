# Common Tasks

## Adding a New Component

1. Use `pnpm generate-machine` to scaffold the package structure
2. Implement the state machine in `{component}.machine.ts`
3. Add framework connections in `{component}.connect.ts`
4. Create E2E tests in `e2e/{component}.e2e.ts`
5. Update documentation and examples
6. Run `pnpm sync-pkgs` to update dependencies

## Modifying Existing Components

1. Update the state machine definition
2. Test across all frameworks
3. Update E2E tests if behavior changes
4. Ensure accessibility compliance
5. Update TypeScript types

## Framework-Specific Changes

1. Modify the framework adapter in `packages/frameworks/{framework}/`
2. Test the specific framework thoroughly
3. Ensure no breaking changes to the API
4. Update framework-specific examples

## Adding Utilities

1. Use `pnpm generate-util` for scaffolding
2. Place in appropriate category under `packages/utilities/`
3. Ensure TypeScript types are exported
4. Add unit tests
5. Update documentation
