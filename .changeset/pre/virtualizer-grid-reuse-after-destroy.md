---
"@zag-js/virtualizer": patch
---

Fixed issue where a grid virtualizer reused after `destroy()` reported a total size of zero, leaving the scroller with
nothing to scroll (React Strict Mode remount). `init()` now rebuilds the size trackers `destroy()` released, and
notifies subscribers so they re-render with the restored size.
