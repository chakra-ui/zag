---
"@zag-js/dom-query": patch
---

- Fix Escape being ignored for a frame when overlay content mounts through presence (`lazyMount`/`unmountOnExit`).
  `whenNode` now picks up a node that commits after its microtask check as soon as it's inserted, instead of waiting for
  the next animation frame.
