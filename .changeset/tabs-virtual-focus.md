---
"@zag-js/tabs": major
---

**Breaking:** Replace `composite` prop with `virtualFocus` in Tabs.

The vague `composite` boolean has been replaced with `virtualFocus`, a well-known accessibility concept that
is self-documenting.

- `virtualFocus: false` (default) — roving tabindex, arrow keys move DOM focus. Standard standalone tabs.
- `virtualFocus: true` — all triggers are tabIndex -1, arrow keys update selected tab without moving DOM focus.
  Used when tabs are embedded inside another composite widget (e.g. combobox/tabs pattern).

> Note: the boolean is inverted relative to `composite`.

### Migration

```diff
- tabs.machine({ composite: false })
+ tabs.machine({ virtualFocus: true })
```

```diff
- tabs.machine({ composite: true })
+ tabs.machine({ virtualFocus: false })
  // or simply omit — false is the default
```

### Why

- `virtualFocus` is a well-known a11y concept (managing focus via state instead of DOM focus)
- Self-documenting — no one knows what `composite` means without reading docs
- Consistent with how `composite` was removed from select, menu, and combobox
