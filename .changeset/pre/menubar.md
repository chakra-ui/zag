---
"@zag-js/menubar": major
---

- **Breaking:** Report a menu's real close reason in the `menu:close` event, using the same names as the menu, such as
  `escape-key` or `interact-outside`. Moving to a sibling menu with the arrow keys is now `sibling-open`, like hovering
  to it.

  ```ts
  // before
  if (reason === "list-navigation" || reason === "escape") {
  }
  // after
  if (reason === "sibling-open" || reason === "escape-key") {
  }
  ```
