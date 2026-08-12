---
"@zag-js/dismissable": patch
---

Fix layer stack metadata never being cleared from the layer node itself. `syncLayers` stamps `--layer-index`,
`--nested-layer-count`, `data-nested` and `data-has-nested` on `layer.node` as well as on each style target, but
`remove` cleared only the style targets. A dismissed layer's node kept its last stamp indefinitely, so CSS keyed on
those attributes styled the wrong state until the layer opened again, and the attributes could not be used to tell a
live layer from a removed one.
