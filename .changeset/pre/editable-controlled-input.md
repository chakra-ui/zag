---
"@zag-js/editable": patch
"@zag-js/dom-query": patch
---

- **Editable**: Fix a controlled `value` not being enforced on the input, so rejected edits no longer show and
  formatting keeps the caret in place.
- **DOM Query**: Add `recordCursor` and `restoreCursor`.
