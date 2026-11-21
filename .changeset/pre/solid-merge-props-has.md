---
"@zag-js/solid": patch
---

Fix `mergeProps` checking for a key (`key in props`) by calling every function source. A part whose children came
through `mergeProps` re-created them on each machine update, losing focus and DOM state.
