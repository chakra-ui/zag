---
"@zag-js/pin-input": patch
---

Fix cut (`Ctrl/Meta+X`) being blocked on non-React frameworks. Deletion `beforeinput` events are no longer treated as invalid typed values, so the input handler can splice and shift remaining digits.
