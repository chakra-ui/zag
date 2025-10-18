---
"@zag-js/toast": patch
---

fix(toast): prevent toasts from collapsing when pointer is hovering

Fixed an issue where dismissing a toast by clicking the close button while hovering over the toast group would cause
toasts to immediately collapse, even though the cursor was still within the group.

**Root causes:**

1. **All browsers:** Focus restoration to the trigger button causes the browser to recalculate hover state, removing the
   `:hover` pseudo-class momentarily
2. **Some browsers (particularly Firefox):** DOM mutations (removing toasts) can trigger spurious `mouseleave`/
   `mouseenter` events even when the mouse hasn't moved, causing flickering when multiple toasts are dismissed rapidly

**Solution:**

- Add `isPointerWithin` tracking to only restore focus when pointer has actually left the toast group
- Add `ignoringMouseEvents` flag that blocks all mouse events for 100ms after toast removal
- This prevents spurious event cycles during DOM mutations from triggering unwanted expand/collapse actions

This maintains the expected hover behavior across all browsers while preserving accessibility for keyboard users.
