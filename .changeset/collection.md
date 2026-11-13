---
"@zag-js/collection": minor
---

- Add `PageListCollection`, a list of one page of nested items with `setPage`, `back` and `up` navigation that restores
  each page's query and highlighted item.

- Fix edits like `append` and `setItems` returning a plain collection, so a `GridCollection` keeps its `columnCount`.
