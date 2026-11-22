---
"@zag-js/collection": major
"@zag-js/tree-view": patch
"@zag-js/cascade-select": patch
---

- Replace `new TreeCollection(options)` with `createTreeCollection(options)`. `TreeCollection` is now a type only.
- Speed up tree view by reusing visible rows and checked states until the collection or expanded values change.
- Treat the array from `getVisibleNodes()` as read-only. It is now shared between calls.
- Fix a finished or canceled rename refocusing the input.
