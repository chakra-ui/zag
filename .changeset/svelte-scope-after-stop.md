---
"@zag-js/svelte": patch
---

Fix `derived_inert` warnings when deferred machine work reads `scope` or `computed` values after a Svelte component
unmounts.
