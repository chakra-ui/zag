---
"@zag-js/tree-view": minor
---

- Added `scrollToIndexFn` prop to enable keyboard navigation in virtualized trees
- **[Breaking]:** `getVisibleNodes()` now returns `{ node, indexPath }[]` instead of `node[]`. Returning the index path
  perhaps the most useful use of this function, hence the change.

**Migration:**

```tsx
// Before
const nodes = api.getVisibleNodes()
nodes.forEach((node) => console.log(node.id))

// After
const visibleNodes = api.getVisibleNodes()
visibleNodes.forEach(({ node }) => console.log(node.id))
```
