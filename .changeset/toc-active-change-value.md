---
"@zag-js/toc": patch
---

Fix `onActiveChange` reporting the previous `activeIds` and `activeItems`. In controlled mode this kept the TOC stuck on
the old section when the payload was written back to `activeIds`.
