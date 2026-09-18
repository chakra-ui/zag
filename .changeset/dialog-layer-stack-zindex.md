---
"@zag-js/dismissable": patch
---

Fix issue where a closing stacked dialog/popover lost its stacking order during its exit
animation. `layerStack.remove` now freezes the resolved `z-index` on style targets (e.g.
`Dialog.Positioner`) before clearing the layer CSS variables, so the closing layer stays
visible while its `data-state="closed"` animation runs. When the same node is reactivated,
`syncLayers` drops the frozen value and hands the stacking order back to the layer-variable
mechanism.
