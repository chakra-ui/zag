---
"@zag-js/collection": patch
---

- **ListCollection**
  - Avoid recomputing groups on every call to `at()` and `indexOf()`
  - Fixed bug in `find()` method (was checking `!= null` instead of `!== -1`)

- **GridCollection**
  - Avoid recomputing rows on every call to `getRows()`
