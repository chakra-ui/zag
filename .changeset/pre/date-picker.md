---
"@zag-js/date-picker": patch
---

- Fix the view trigger's accessible name hiding its visible month or year. The `viewTrigger` translation is now its
  `aria-description`, and is omitted when there's no next view.

- Fix week numbers reading `53` instead of `1` for weeks starting in late December.

- Fix focus moving back to the trigger after a right-click outside.

- Compute each day's state once per render instead of twice.
