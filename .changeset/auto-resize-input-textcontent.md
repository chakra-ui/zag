---
"@zag-js/auto-resize": patch
---

Fix a potential XSS vulnerability in `autoResizeInput()` by measuring input values as text instead of parsing them as HTML.
