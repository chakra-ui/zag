---
"@zag-js/core": patch
---

Improve runtime performance by only creating a machine instance once, and updating the context with `setContext(...)`
instead of `withContext(...)`.
