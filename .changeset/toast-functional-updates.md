---
"@zag-js/toast": minor
---

Add functional updates to `toaster.update(id, updater)` so updates can derive new properties from the toast's current
properties, including queued toasts.

Fix removing queued toasts by ID so they cannot be updated or promoted after removal.
