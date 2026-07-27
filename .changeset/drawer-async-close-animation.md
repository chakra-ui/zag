---
"@zag-js/drawer": patch
---

Fix backdrop flicker on controlled close with an async `open` setter by clearing swipe animation overrides only when entering `closing`
