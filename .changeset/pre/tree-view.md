---
"@zag-js/tree-view": major
---

- A branch with no descendants (e.g. an async branch that hasn't loaded) is no longer reported as checked.
- **Breaking:** Renamed `getCellProps` to `getNodeCellProps`, matching the other node-scoped APIs.

### Migration

```diff
- api.getCellProps(nodeProps)
+ api.getNodeCellProps(nodeProps)
```
