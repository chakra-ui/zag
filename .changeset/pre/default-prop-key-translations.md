---
"@zag-js/select": patch
"@zag-js/popover": patch
"@zag-js/carousel": patch
"@zag-js/clipboard": patch
---

Fixed issue where `translations` was typed as always-defined on the machine service. `prop("translations")` now reflects
that it may be `undefined`.
