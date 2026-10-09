---
"@zag-js/date-picker": patch
---

Add `contentRoleDescription` and `tableRoleDescription` to `translations`, so the `aria-roledescription` of the content
and table parts can be localized. The input placeholder now takes its day, month and year letters from
`translations.placeholder(locale)` (for example `TT.MM.JJJJ` for `de-DE`). The defaults are unchanged.
