---
"@zag-js/date-picker": patch
---

Fix the `aria-label` from `getViewTriggerProps()` naming the wrong view. In day view it announced "Switch to year view"
while the trigger actually switches to month view. `translations.viewTrigger` now receives the resolved next view, and
the trigger disables itself once there's no further view to switch to.

Fix `translations.dayCell()` announcing the generic "Choose" label for dates between a selected range's start and end.
It now announces "In range".
