---
"@zag-js/date-picker": patch
---

- Fix Space not selecting the focused date in the calendar.
- Fix focus being pulled back to the input or trigger after closing when focus had moved elsewhere, e.g. from
  `onValueChange`.
- Fix the trigger missing its focus ring in Firefox after closing with Escape.
