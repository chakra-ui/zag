---
"@zag-js/tree-view": major
---

**Breaking:** Rename `getCellProps` to `getNodeCellProps` for consistency with the other node-scoped tree-view APIs.

### Migration

```diff
- api.getCellProps(nodeProps)
+ api.getNodeCellProps(nodeProps)
```
