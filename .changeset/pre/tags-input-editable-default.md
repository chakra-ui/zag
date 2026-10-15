---
"@zag-js/tags-input": major
---

**Breaking:** `editable` now defaults to `false`, so tags are add/remove only. Opt in to keep inline editing:

```diff
  tagsInput.machine({
+   editable: true,
  })
```
