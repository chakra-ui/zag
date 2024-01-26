---
"@zag-js/preact": patch
"@zag-js/react": patch
"@zag-js/store": patch
---

Fix issue where context mutation updates were missed due to the underlying `proxy-compare` regression.
