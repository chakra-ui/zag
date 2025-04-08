---
"@zag-js/toast": minor
---

Add support for queuing toasts that exceed the maximum limit. When the maximum number of toasts is reached:

- New toasts are added to a queue instead of being dropped
- Queued toasts are automatically displayed when space becomes available (after existing toasts are removed)
- Queue is cleared when all toasts are removed
