---
"@zag-js/svelte": patch
---

Fixed issue where `normalizeProps` rendered a `children` prop as a DOM attribute (e.g. `children="Hello World"` on the
editable preview).
