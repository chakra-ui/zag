---
"@zag-js/scroll-snap": patch
---

Fix issue where `findSnapPoint` returned incorrect positions for `center` and `end` aligned items and in RTL,
breaking carousel page detection when scrolling to a specific item.
