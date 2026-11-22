---
"@zag-js/collection": minor
"@zag-js/tree-view": patch
---

- Add `getTreeCheckedStates` and `toggleTreeChecked` to compute checked states in one pass.
- Speed up large trees: on 10k nodes, checked state drops from ~450ms to ~4ms per render, and rendering and keyboard
  navigation get 3–5x faster.
