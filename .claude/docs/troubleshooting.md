# Troubleshooting

## Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Test Failures**: Verify E2E test setup and browser compatibility
   - E2E tests run against built code - changes need to be built first
   - Use `pnpm pw-test {component}.e2e.ts` to run specific E2E tests
   - Add `.only` to test declarations for focused testing
3. **Framework Issues**: Check framework adapter implementation
4. **Type Errors**: Ensure proper type exports and imports

## Debugging Tips

1. Use framework examples for testing changes
2. Check E2E test results for cross-framework issues
3. Verify accessibility with screen readers and keyboard navigation
4. Test in multiple browsers
5. For keyboard/input issues, check both the machine logic and the connect file event handlers
