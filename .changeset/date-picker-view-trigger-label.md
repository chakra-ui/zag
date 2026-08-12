---
"@zag-js/date-picker": patch
---

Fix `getViewTriggerProps()`'s `aria-label` naming the wrong view (e.g. "Switch to year view" while in day view, which actually switches to month view). `translations.viewTrigger` now receives the resolved next view, and the trigger disables itself once there's no further view to switch to.

Fix `translations.dayCell()` to announce "In range" for dates between a selected range's start and end, instead of the generic "Choose" label.
