---
"@zag-js/collection": major
"@zag-js/autocomplete": patch
"@zag-js/combobox": patch
"@zag-js/gridlist": patch
"@zag-js/listbox": patch
"@zag-js/menu": patch
"@zag-js/select": patch
---

- Replace `new ListCollection`, `new GridCollection` and `new PageListCollection` with `createListCollection`,
  `createGridCollection` and `createPageListCollection`. The class names are now types only.
- Add `getSelectAllCoverage`, `selectAllValues` and `toggleSelectAll`.
- Speed up list collections: creating one is up to 100x faster, `toString()` is cached, and filtering, `remove`,
  `moveBefore`, `moveAfter` and `getValueRange` run 3–70x faster on large lists. `filePathToTree` is about 50x faster
  for large folders.
- Fix `moveBefore` and `moveAfter` corrupting the list when a moved value isn't in the collection.
- Fix `Selection.canSelect` allowing disabled items.
- Fix `GridCollection.getRows()` keeping the old layout after `columnCount` changes.
