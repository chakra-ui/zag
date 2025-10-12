---
"@zag-js/toast": patch
---

fix(toast): prevent toasts from collapsing when pointer is hovering

Fixed an issue where dismissing a toast by clicking the close button while hovering over the toast group would cause
toasts to immediately collapse, even though the cursor was still within the group. This was caused by focus restoration
triggering browser hover state recalculation.

The fix adds pointer tracking to only restore focus and collapse toasts when the pointer has actually left the toast
group, maintaining the expected hover behavior.
