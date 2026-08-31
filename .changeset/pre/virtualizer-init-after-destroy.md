---
"@zag-js/virtualizer": patch
---

Fixed issue where `init()` after `destroy()` left the instance inert (React Strict Mode remount). Scroll and store
updates are ignored while `isDestroyed` is true, and `init()` did not clear that flag.
