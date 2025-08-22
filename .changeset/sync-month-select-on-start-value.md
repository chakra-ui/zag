---
"@zag-js/date-picker": patch
---

fix(date-picker): ensure Month/Year select labels update under min/max constraints

- Sync Month/Year `<select>` values when `startValue` changes so the labels reflect the visible month/year even if `focusedValue` doesn't change.
- Add `hash` for `startValue` to enable efficient watcher updates.
- Remove duplicate select sync from `focusedValue` watcher (syncs now only on `startValue`).