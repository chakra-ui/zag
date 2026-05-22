---
"@zag-js/dismissable": patch
---

Deduplicate `layerStack.add()` by DOM node so the same element is not registered twice (e.g. React Strict Mode). Fixes incorrect `data-has-nested`, `--layer-index`, and `--nested-layer-count` on a single open dialog.
