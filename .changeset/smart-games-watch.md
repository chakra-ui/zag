---
"@zag-js/aria-hidden": patch
---

Fixed accessibility warning related to `aria-hidden` on touch devices.

**The error reads:**

"Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive
technology users. Avoid using aria-hidden on a focused element or its ancestor"
