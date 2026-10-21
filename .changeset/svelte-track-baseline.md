---
"@zag-js/svelte": patch
"@zag-js/solid": patch
---

- Fix machines missing prop changes made before their first effect run, such as presence staying unmounted while
  `present` is `true`.
