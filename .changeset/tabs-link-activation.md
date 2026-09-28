---
"@zag-js/tabs": patch
---

Fix programmatic tab selection triggering link navigation. Keyboard link activation now bubbles and can be canceled by
application click handlers, and custom navigation prevents the browser's default navigation.
