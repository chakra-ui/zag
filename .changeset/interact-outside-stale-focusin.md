---
"@zag-js/interact-outside": patch
---

- Fix a deferred focus-outside check firing after focus had already moved back, which could take a navigation menu's links out of the Tab order when tabbing out and back quickly.
