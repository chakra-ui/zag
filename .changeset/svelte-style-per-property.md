---
"@zag-js/svelte": patch
---

- Fix component styles being lost on re-render, which left popups in the top-left corner and closed nested menus as they
  opened.
- Raise the minimum `svelte` peer version to `5.29.0`.
