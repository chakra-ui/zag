---
"@zag-js/tour": minor
---

- Add `scrollToTargetFn` to customize how a step's target is scrolled into view.
- Add `data-instant` to the backdrop, spotlight and positioner when they should snap into place instead of animating.
- Use the `dialog` role for the content instead of `alertdialog`.
- Fix focus moving to the page body when the tour is dismissed, skipped or ends because a step target is missing.
- Fix arrow keys changing steps while typing in an input inside the tour content.
- Fix the content shifting by half the arrow's size right after a step opens.
