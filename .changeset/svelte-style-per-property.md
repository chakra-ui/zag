---
"@zag-js/svelte": patch
---

- Fix styles set by components being lost when the element re-renders, which left popups like context menus and
  cascade selects stuck in the top-left corner and closed nested menus as soon as they opened.
- Raise the minimum `svelte` peer version to `5.29.0`.
