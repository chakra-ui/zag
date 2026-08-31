---
"@zag-js/utils": patch
"@zag-js/core": patch
"@zag-js/date-input": patch
---

Improved performance of state machine hot paths, and fixed an equality bug that could leave derived values stale.

- Cached state chains and tag lookups per machine config, so nested state transitions and `hasTag` no longer rebuild the
  chain on every call.
- Made `isEqual` cheaper by comparing arrays in place instead of copying them.
- Fixed issue where a value that lost a key compared equal to its wider previous value. Removing a key from an object
  now correctly invalidates memoized values and restarts `watchEffect` effects that depend on it.
- Fixed issue where the date input rebuilt its segments on every render when a `translations` object was passed inline.

`isEqual` now compares functions by reference rather than by source text, and only considers an object's own properties.
Values that relied on the previous behavior (a function recreated inline, or a property inherited from a prototype) now
compare as unequal.
