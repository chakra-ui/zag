---
"@zag-js/tabs": patch
---

Fixed `onValueChange` and `onFocusChange` details being typed as `string` when they can be `null`. `value` is `null`
after a `deselectable` tab is deselected, and `focusedValue` is `null` when focus leaves the tab list.
