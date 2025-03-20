---
"@zag-js/splitter": minor
---

[Breaking] Redesign splitter machine to support more use cases and improve DX.

The key breaking change is:

Before:

```ts
const service = useMachine(splitter.machine, {
  id: useId(),
  defaultSize: [
    { id: "a", size: 50 },
    { id: "b", size: 50 },
  ],
})
```

After:

```ts
const service = useMachine(splitter.machine, {
  id: useId(),
  panels: [{ id: "a" }, { id: "b" }],
  defaultSize: [50, 50],
})
```

The also comes with new features such as:

- Support for collapsible panels
- Support for collapse and expand events
- New `api` methods for resizing the panels programmatically
