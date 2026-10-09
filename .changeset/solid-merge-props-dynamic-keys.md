---
"@zag-js/solid": patch
---

Fix `mergeProps` dropping keys a source adds after the first render, which kept nested menus from opening on hover or
with the keyboard.
