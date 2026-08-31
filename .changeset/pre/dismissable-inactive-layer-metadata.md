---
"@zag-js/dismissable": patch
---

Fix removed dismissable layers retaining stack data attributes and CSS variables when their elements remain mounted.
This clears `data-nested`, `data-has-nested`, `--layer-index`, `--nested-layer-count`, and the derived `--z-index` after
removal, including when a layer has nested children.
