---
"@zag-js/date-picker": patch
---

Fix the calendar briefly flashing the day view when closing while on the month or year view.
The active view was reset on close (during the exit animation), so the day view became visible
for the duration of the close. The view is now reset when the picker opens instead, preserving
the current view through the close animation.
