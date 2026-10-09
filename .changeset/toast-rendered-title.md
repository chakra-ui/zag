---
"@zag-js/toast": patch
---

Fixed the toast root pointing `aria-labelledby` and `aria-describedby` at a title or description that is not rendered
(for example, custom toast content that omits those parts). The references are now set only when the part is in the DOM.
