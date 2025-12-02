---
"@zag-js/pagination": minor
---

**Pagination**: Add first/last triggers and improve visual balance

- Add `getFirstTriggerProps()` and `getLastTriggerProps()` methods for navigating to first/last page
- Add `boundaryCount` parameter for controlling boundary pages (start/end)
- Fix ellipsis showing when only 1 page gap
- Implement balanced pagination algorithm for consistent UI elements
- Maintain visual consistency with max 7 elements regardless of total pages
