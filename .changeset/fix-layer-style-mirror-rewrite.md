---
"@zag-js/dismissable": patch
---

Fix issue where layer stack metadata (`--layer-index`, `--nested-layer-count`,
`--z-index`) disappeared from style targets like `Drawer.Backdrop` when a
framework re-render replaced the inline style, e.g. while dragging drawer
content.
