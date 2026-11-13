---
"@zag-js/infinite-scroll": major
---

- Fix `@zag-js/infinite-scroll/anatomy` failing to resolve.

- Fix loading more stopping after the list is replaced, such as by a new search, or when the sentinel renders late.

- **Breaking:** Rename the `manual` load reason to `script`, the reason every machine uses for an API call.

  ```ts
  // before
  if (reason === "manual") {
  }
  // after
  if (reason === "script") {
  }
  ```
