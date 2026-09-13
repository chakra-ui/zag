---
"@zag-js/live-region": patch
"@zag-js/combobox": patch
"@zag-js/select": patch
---

Fixed issues with screen reader announcements.

- Fixed issue where the region was rebuilt on every `announce()`, so screen readers missed it — VoiceOver in particular.
- Fixed issue where announcements were never cleared and stayed in the accessibility tree. Added a `timeout` option and
  a `clear()` method.
- Fixed issue where combobox and select left a stale announcement in place when nothing was highlighted.
- Added `aria-atomic="true"` and a separate region per level, so a polite announcer cannot inherit an assertive one.
