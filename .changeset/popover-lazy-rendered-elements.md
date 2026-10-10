---
"@zag-js/popover": patch
---

Fixed the popover content missing `aria-labelledby` and `aria-describedby` when the content is rendered only while open
(lazy mounting). The title and description are now detected each time the popover opens.
