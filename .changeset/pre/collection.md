---
"@zag-js/collection": major
---

- **Breaking:** Create collections with functions. The class names are now types only.

  ```diff
  - new ListCollection({ items })
  + createListCollection({ items })
  ```

  The same goes for `createGridCollection`, `createPageListCollection` and `createTreeCollection`.

- **Breaking:** Treat the array from `getVisibleNodes()` as read-only. It is now shared between calls.

- Add `getSelectAllCoverage`, `selectAllValues`, `toggleSelectAll` and `getEnabledValues()`.

- Add `navigate({ before, after })` to walk extra values, like a select-all option, before and after the items.

- Add `getTreeCheckedStates` and `toggleTreeChecked` to compute checked states in one pass.

- Speed up large collections: creating a list is up to 100x faster, filtering, `remove`, `moveBefore`, `moveAfter` and
  `getValueRange` 3–70x faster, `filePathToTree` about 50x faster, and tree checked states drop from ~450ms to ~4ms on
  10k nodes.

- Fix `moveBefore` and `moveAfter` corrupting the list when a moved value isn't in the collection.

- Fix `Selection.canSelect` allowing disabled items.

- Fix `GridCollection.getRows()` keeping the old layout after `columnCount` changes.

- Fix typeahead ignoring accents and jumping past the active item while typing more of its text.
