---
"@zag-js/pin-input": major
---

**Breaking:** `count` is now a required prop.

The machine no longer infers the number of inputs by querying the DOM. Pass `count` explicitly.

```diff
  pinInput.machine({
    id: "pin",
+   count: 4,
  })
```

### Why

- **Predictable** — machine knows the count upfront without waiting for DOM to render
- **Simpler internals** — no DOM queries or mutation observers to detect input elements
- **SSR-friendly** — count is available before hydration
- **Consistent** — aligns with how carousel, rating, and pagination handle counts
