---
"@zag-js/popper": patch
---

Fix the positioner ignoring a stylesheet's `z-index`. The positioner carried an inline `z-index: var(--z-index)` and
the utility filled that variable with the content's computed `z-index` — `auto` when the content sets none — so an
inline `auto` beat every rule targeting the positioner and the popper stayed in the page's base stacking layer. The
hoist now writes `z-index` only when the content has a real stacking level to lift.
