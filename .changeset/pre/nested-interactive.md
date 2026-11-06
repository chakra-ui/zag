---
"@zag-js/gridlist": patch
"@zag-js/tree-view": patch
---

- Clicking a button or link inside a gridlist row, or inside a tree node (e.g. an actions menu trigger), no longer
  selects the row or node.
- **Gridlist:** The gridlist can be reached with Tab again after losing focus, and tabbing in focuses the selected item,
  or the first item when nothing is selected.
