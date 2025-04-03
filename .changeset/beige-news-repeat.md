---
"@zag-js/collection": minor
---

- **ListCollection**

  - Fix stale issues in mutation methods by returning a new `ListCollection` instead of mutating the internal `items`

    - Add new methods to the list collection: `update`, `upsert`, `remove`, `append`, `prepend`, `move`

- **GridCollection**

  - Add new methods to the grid collection: `getCell`, `getValueCell`, `getFirstEnabledColumnIndex`,
    `getLastEnabledColumnIndex`, `getNextRowValue`, `getPreviousRowValue`
