---
"@zag-js/svelte": patch
---

- Fix `derived_inert` warnings when a machine reads props, `scope` or computed values after its Svelte component
  unmounts.
