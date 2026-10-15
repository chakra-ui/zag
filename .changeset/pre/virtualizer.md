---
"@zag-js/virtualizer": patch
---

Fixes:

- `getContentStyle()` and related helpers return CSS lengths with `px` units instead of unitless numbers.
- `getContentStyle()` sets `flex-shrink: 0`, so the content no longer shrinks inside a flex scroller.
- `init()` after `destroy()` (e.g. a React Strict Mode remount) restores the instance, including a grid's total size.
