---
"@zag-js/toggle-group": patch
"@zag-js/dom-query": patch
---

- **Toggle Group**
  - Fix a disabled group trapping Tab on its root.
  - Fix clicking the gap between items moving focus onto the root.
  - Fix the focused item not scrolling into view when the group overflows.
  - Keep the last pressed item pressed in a `multiple` group when `deselectable` is `false`.
- **DOM Query**: Add `getFocusTarget`.
