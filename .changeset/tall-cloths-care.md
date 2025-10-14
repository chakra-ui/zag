---
"@zag-js/checkbox": patch
---

- Fix issue where setting initial checked state to `indeterminate` doesn't work
- Ensure `api.checkedState` returns the correct checked state (`boolean | "indeterminate"`)
