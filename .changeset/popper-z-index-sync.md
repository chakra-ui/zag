---
"@zag-js/popper": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/menu": patch
"@zag-js/popover": patch
"@zag-js/hover-card": patch
"@zag-js/color-picker": patch
"@zag-js/cascade-select": patch
"@zag-js/date-picker": patch
---

Fixed issue where a lazily mounted popup inside nested dialogs rendered behind the dialog.

- The positioner's z-index now follows the content's z-index, including after the layer index updates
- The z-index is kept during the exit animation
