---
"@zag-js/tooltip": patch
---

Fix issue where unmounting an open tooltip left its id in the global store,
causing every tooltip opened afterwards to skip its open delay.
