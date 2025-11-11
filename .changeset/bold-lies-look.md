---
"@zag-js/carousel": patch
"@zag-js/slider": patch
"@zag-js/splitter": patch
"@zag-js/color-picker": patch
"@zag-js/dom-query": patch
---

Fix dragging behavior that stops working after switching browser tabs or scrolling the page. The issue was caused by
incorrectly checking `event.button` instead of `event.buttons` to detect interrupted drag operations.
