---
"@zag-js/floating-panel": patch
---

- Fix the positioner's inline `z-index` overriding the `z-index` from CSS. Set `z-index: var(--z-index)` on the
  positioner to keep panel stacking.
