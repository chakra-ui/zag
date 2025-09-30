---
"@zag-js/focus-visible": patch
---

Fix `"Cannot assign to read only property 'focus'"` console error by gracefully handling environments where
`HTMLElement.prototype.focus` is non-configurable.
