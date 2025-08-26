---
"@zag-js/dismissable": patch
---

Expose `onRequestDismiss` custom event handler for event a parent layer requests the child layer to dismiss. If
prevented via `event.preventDefault()`, the child layer will not dismiss when the parent layer is dismissed.
