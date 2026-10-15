---
"@zag-js/rating-group": patch
---

Fix `aria-checked` being set on rating items that are not selected. It now only reflects the committed value, so the
first item (when there is no value) and the hovered item are no longer announced as checked (fixes #3456).
