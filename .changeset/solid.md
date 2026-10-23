---
"@zag-js/solid": patch
---

- Fix machines missing prop changes made before their first effect run, such as presence staying unmounted while
  `present` is `true`.
- Fix `watch` missing context changes made by entry actions, such as pin input's `autoFocus` having no effect.
