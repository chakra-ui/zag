---
"@zag-js/dismissable": patch
"@zag-js/popover": patch
"@zag-js/menu": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/hover-card": patch
"@zag-js/color-picker": patch
"@zag-js/cascade-select": patch
---

Fix nested popups rendering behind their parent layer when using `--layer-index` with `lazyMount` or `unmountOnExit`.
Keep the positioner's z-index synchronized with its dismissable layer and preserve it during exit animations.
