---
"@zag-js/carousel": patch
"@zag-js/scroll-snap": patch
"@zag-js/dom-query": patch
---

Fix controlled carousel inside dialog jumping or skipping pages.

- Fix carousel navigation inside CSS-transformed containers (e.g., dialogs with open/close animations)
- Fix scroll position drifting when container layout shifts (e.g., scrollbar removal)
