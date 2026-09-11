---
"@zag-js/core": patch
"@zag-js/preact": patch
"@zag-js/react": patch
"@zag-js/solid": patch
"@zag-js/vanilla": patch
"@zag-js/cascade-select": patch
"@zag-js/collapsible": patch
"@zag-js/color-picker": patch
"@zag-js/combobox": patch
"@zag-js/date-picker": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/floating-panel": patch
"@zag-js/hover-card": patch
"@zag-js/menu": patch
"@zag-js/popover": patch
"@zag-js/select": patch
"@zag-js/tooltip": patch
---

Fix `api.setOpen` ignoring a second call made in the same tick. `setOpen(true)` immediately followed by `setOpen(false)`
left the component open instead of closed, and only worked if you awaited a microtask between the two calls.

The last call in a tick now wins, and calling `setOpen` repeatedly with the same value still invokes `onOpenChange`
once. Drawer's `api.setSnapPoint` had the same problem and behaves the same way now.
