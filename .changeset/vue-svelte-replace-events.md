---
"@zag-js/vue": patch
"@zag-js/svelte": patch
---

- Fix repeated `setOpen` or `setSnapPoint` calls in the same tick each applying and calling the change callback. The
  last call now wins and the callback fires once, as in React. Read the new state in the callback or after `nextTick()`
  (Vue) or `tick()` (Svelte), not right after the call.
