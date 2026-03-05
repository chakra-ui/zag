---
"@zag-js/tags-input": minor
---

Add `allowDuplicates` prop to allow duplicate tags (fixes #78, #2928).

When `allowDuplicates: true`, the same tag can be added multiple times. Previously, duplicates were always prevented
internally, so `validate` returning `true` did not allow duplicate tags to be added.

**Supported use cases:**

- **Sentence builders** — Build phrases from repeatable tokens (e.g. `"Hello"`, `","`, `" "`, `"world"`). Tokens can
  appear multiple times with different separators per item.
- **Repeatable tokens** — Predefined values that users may select multiple times (e.g. `"a"`, `"a"`, `"b"`).
- **Validate-controlled behavior** — Use `validate` to control what gets added without implicit deduplication. When
  `validate` returns `true`, the tag is added as-is.

```js
useMachine(tagsInput.machine, {
  allowDuplicates: true,
})
```
