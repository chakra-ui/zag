---
"@zag-js/solid": patch
---

- Fix `mergeProps` re-creating children passed through it on each machine update, which lost focus and DOM state.
