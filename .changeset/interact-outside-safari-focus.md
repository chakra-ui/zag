---
"@zag-js/interact-outside": patch
---

Fix issue where nested popovers and select within popovers didn't toggle correctly in Safari due to `focusin` events
racing with pointer interactions
