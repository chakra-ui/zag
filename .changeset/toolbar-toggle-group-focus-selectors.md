---
"@zag-js/toggle-group": patch
"@zag-js/toolbar": patch
---

Removed `data-focus` from toggle group and toolbar parts. Use native CSS selectors like `:focus-visible` to style the focused item and `:focus-within` to style the root while focus is inside.

