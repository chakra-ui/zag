---
"@zag-js/pin-input": patch
---

Fix issue in Vanilla.js where paste does not work due to `maxlength="1"` truncating clipboard data before the input
event.
