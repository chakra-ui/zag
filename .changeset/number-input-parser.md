---
"@zag-js/number-input": patch
---

- Read typed numbers with a built-in parser instead of `@internationalized/number`, which is no longer a dependency.
- Fix values smaller than the default three decimals showing as `0` when `formatOptions` is set, like `0.0001` with a
  `0.0001` step.
- Fix an empty or sign-only percent being read as `0`.
- Add support for Persian digits in any locale.
