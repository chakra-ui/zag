---
"@zag-js/select": patch
---

Don't throw in `announceHighlightedItem` when `translations` is omitted, so highlighting an item no longer unmounts the
select.
