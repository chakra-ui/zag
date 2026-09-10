---
"@zag-js/vanilla": minor
---

Fix `spreadProps` replacing the whole `style` attribute, which wiped inline styles set on the element by other code
(like the layer stack's `--layer-index` or popper's `--x`/`--y`).

`normalizeProps` and `mergeProps` now return `style` as an object instead of a CSS string, and `spreadProps` applies it
property by property. Use the exported `toStyleString` if you need the string form.
