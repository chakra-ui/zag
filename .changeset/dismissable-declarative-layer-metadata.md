---
"@zag-js/dismissable": major
"@zag-js/cascade-select": patch
"@zag-js/color-picker": patch
"@zag-js/combobox": patch
"@zag-js/date-picker": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/hover-card": patch
"@zag-js/menu": patch
"@zag-js/navigation-menu": patch
"@zag-js/popover": patch
"@zag-js/select": patch
---

Move layer stack styles and attributes into machine connect props so framework renders cannot overwrite them.

**Breaking:** `trackDismissableElement` now requires `onLayerChange`. Apply the emitted snapshot's layer index, nesting
metadata, and pointer blocking state to the registered element through your framework's render output.
