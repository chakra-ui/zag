---
"@zag-js/svelte": patch
---

- Fix machines missing prop changes made before their first effect run, such as presence staying unmounted while
  `present` is `true`.
- Fix component styles being lost on re-render, which left popups in the top-left corner and closed nested menus as they
  opened.
- Fix `derived_inert` warnings when a machine reads props, `scope` or computed values after its component unmounts.
- Raise the minimum `svelte` peer version to `5.29.0`.
