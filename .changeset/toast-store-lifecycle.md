---
"@zag-js/toast": patch
---

- Fixed issue where queued toast updates and dismissal were not applied correctly.
- Fixed issue where dismissed toasts could reappear after a promise settled.
- Fixed issue where newly created or updated toasts could lose paused timers.
- Fixed issue where subscription callbacks could cause lost toast updates.
