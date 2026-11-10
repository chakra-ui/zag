---
"@zag-js/floating-panel": patch
---

- Fix the positioner ignoring the content's `z-index`, which kept panels under other fixed elements. The positioner now
  uses the content's `z-index` plus the panel's place in the stack.
- Add the `--layer-index` CSS variable to the positioner.
