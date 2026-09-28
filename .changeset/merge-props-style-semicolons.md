---
"@zag-js/core": patch
"@zag-js/svelte": patch
---

Fix `mergeProps` truncating inline style values that contain semicolons, including quoted CSS custom properties and data
URLs.
