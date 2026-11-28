---
"@zag-js/tree-view": patch
---

- Speed up large trees: on 10k nodes, checked state drops from ~450ms to ~4ms per render, and rendering and keyboard
  navigation get 3–5x faster.

- Fix a finished or canceled rename refocusing the input.
