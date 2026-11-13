---
"@zag-js/toggle-group": patch
---

- Fix a disabled group trapping Tab on its root.

- Fix clicking the gap between items moving focus onto the root.

- Fix focus jumping back into the group when tabbing out right after an arrow, Home or End key.

- Fix the focused item not scrolling into view when the group overflows.

- Keep the last pressed item pressed in a `multiple` group when `deselectable` is `false`.
