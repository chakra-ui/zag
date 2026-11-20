---
"@zag-js/date-picker": patch
"@zag-js/types": patch
---

- Fix the view trigger's accessible name hiding its visible month or year text. The `viewTrigger` translation is now the
  trigger's `aria-description` instead of its `aria-label`, and is omitted when there's no next view.
- Add `aria-description` to the typed ARIA attributes.
