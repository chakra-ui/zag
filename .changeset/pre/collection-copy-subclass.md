---
"@zag-js/collection": patch
---

- Return the same collection class from edits like `append` and `setItems`, so a `GridCollection` keeps its
  `columnCount`.
