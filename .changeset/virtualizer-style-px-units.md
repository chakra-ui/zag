---
"@zag-js/virtualizer": patch
---

Fixed issues with the generated style helpers.

- Fixed issue where `getContentStyle()` and related helpers returned unitless numbers that browsers ignore as CSS.
- Fixed issue where the content element shrank inside a flex scroller. `getContentStyle()` now sets `flex-shrink: 0`.
