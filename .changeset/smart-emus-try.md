---
"@zag-js/collection": patch
---

Widen `items` type to allow `Iterable` instead of just `Array` since we internally convert iterables to an array.
