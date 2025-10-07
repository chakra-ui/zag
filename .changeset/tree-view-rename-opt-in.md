---
"@zag-js/tree-view": patch
---

- Fixed issue where pressing `F2` on any tree node would lock navigation and prevent selecting other nodes.
- The rename feature now requires the `canRename` callback to be explicitly provided, making it opt-in rather than
  opt-out.
