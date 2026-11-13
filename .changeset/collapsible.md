---
"@zag-js/collapsible": minor
---

- Add `hiddenUntilFound`, so closed content stays searchable with the browser's find-in-page. A match opens it.

- Add `getRootState()` with `open`, `visible` and `disabled`, and `data-disabled` on the root.

- Add `instant` to the content state, set when the content starts open and skips its animation.

- Remove `getTriggerState()`, which returned the same state as the root. Use `getRootState()`.
