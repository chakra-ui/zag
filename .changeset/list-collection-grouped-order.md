---
"@zag-js/collection": patch
---

- Fix list collections that use `groupBy` changing the wrong item on `update`, `upsert`, `insertBefore`, `insertAfter`,
  and `move`.
- Fix typeahead in list collections that use `groupBy` skipping items, so repeated keys now cycle through matching items
  in the grouped order.
