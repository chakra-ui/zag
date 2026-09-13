---
"@zag-js/pin-input": patch
---

Fixed issue where cut (`Ctrl/Meta+X`) was blocked on non-React frameworks. Deletion `beforeinput` events are no longer
treated as invalid typed values.
