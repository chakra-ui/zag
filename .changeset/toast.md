---
"@zag-js/toast": patch
---

- Move focus to the next toast when a focused toast is dismissed, and back to the previously focused element after the
  last one.
- Fix toasts staying paused after a focused toast is dismissed, or after closing one with the mouse and moving the
  pointer away.
- Fix new and queued toasts appearing collapsed while the stack is expanded.
- Fix toast height not updating when its content resizes.
- Fix swapped offsets when several toasts are created at once in adapters that batch renders (e.g. Vue).
