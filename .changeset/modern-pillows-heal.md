---
"@zag-js/collection": patch
---

Improve the APIs around `tree.flatten(...)` and `flattenedToTree` to ensure the original node properties are preserved.

```ts
const tree = new TreeCollection({
  nodeToChildren: (node) => node.children ?? [],
  rootNode: {
    value: "ROOT",
    children: [{ value: "child1" }, { value: "child2" }],
  },
})

const flattened = tree.flatten()
const reconstructed = flattenedToTree(flattened)

console.log(reconstructed.rootNode)

// {
//   value: "ROOT",
//   children: [{ value: "child1" }, { value: "child2" }],
// }
```
