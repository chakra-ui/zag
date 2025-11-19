---
"@zag-js/combobox": patch
---

Fix `onHighlightChange` not being invoked when collection is filtered to empty results. The callback now correctly
receives `{ highlightedValue: null, highlightedItem: null }` when the collection becomes empty.
