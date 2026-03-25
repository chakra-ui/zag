---
"@zag-js/core": patch
---

Validate compound states at machine creation: throw if a state has child states but no `initial`, or if `initial`
references a nonexistent child.
