---
"@zag-js/number-input": patch
---

- Read typed numbers with a built-in parser; `@internationalized/number` is no longer a dependency.

- Add Persian digits in any locale.

- Pause a stepper's spin while the pointer is off the button, and step again when it comes back.

- Fix values smaller than three decimals showing as `0` when `formatOptions` is set, like `0.0001`.

- Fix an empty or sign-only percent being read as `0`.
