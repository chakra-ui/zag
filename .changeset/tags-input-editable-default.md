---
"@zag-js/tags-input": major
---

**Breaking:** `editable` now defaults to `false`.

Inline editing of existing tags (via double-click or pressing `Enter` on a highlighted tag) is now opt-in. Tags are add/remove only by default.

```diff
  tagsInput.machine({
    id: "tags",
+   editable: true, // add this to preserve inline rename
  })
```

### Why

- **Simpler default** — most usages only need add/remove, not inline rename
- **Less surprise** — double-click to edit is a power-user feature that should be opted into
- **Matches peers** — aligns with how other tag input libraries behave out of the box
