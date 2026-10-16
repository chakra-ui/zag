---
"@zag-js/solid": patch
---

Fix `watch` missing context changes made by a machine's entry actions. For example, `autoFocus` on pin input had no
effect.
