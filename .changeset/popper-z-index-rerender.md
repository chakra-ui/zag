---
"@zag-js/popper": patch
---

- Fix the positioner losing its inline `z-index` after a Vue re-render. The floating styles no longer include a
  `zIndex: undefined` key, which Vue clears from the element on every patch.
