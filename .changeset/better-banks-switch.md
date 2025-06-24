---
"@zag-js/toast": patch
---

Fix issue where app crashes when `toaster.promise` is called without loading option.

- Now, the toast will not be created if the `loading` option is not provided.
- The `loading` option is now required. A warning will be logged if it is not provided.
