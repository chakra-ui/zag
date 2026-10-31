---
"@zag-js/tags-input": minor
---

- Added `api.highlightedValue` to read the value of the highlighted tag.

```tsx
const api = tagsInput.connect(service, normalizeProps)
api.highlightedValue // "React" | null
```

- Fixed `onHighlightChange` reporting the tag's DOM id as `highlightedValue` instead of the tag's value.
