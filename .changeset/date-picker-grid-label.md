---
"@zag-js/date-picker": patch
---

- Fixed issue where the calendar grid had no accessible name. It is now labelled with the visible month, formatted in
  the picker's `locale`.
- Removed the English-only `aria-roledescription` from the content and table parts.
- Fixed issue where `translations.placeholder` was ignored by the input placeholder.
