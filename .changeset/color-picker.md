---
"@zag-js/color-picker": patch
---

- Fix focus being pulled back to the trigger after closing when focus had moved elsewhere, e.g. from `onValueChange`.
- Fix the trigger missing its focus ring in Firefox after closing with Escape.
