---
"@zag-js/aria-hidden": patch
---

Fix an issue where an open nested dialog could keep an `aria-hidden` ancestor when its portal was already in the DOM
before the parent dialog opened.
