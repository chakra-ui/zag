---
"@zag-js/date-picker": patch
"@zag-js/date-input": patch
"@zag-js/date-utils": patch
---

Fix issue where the date input was not writable in locales whose date format separator contains more than one character
(e.g. `cs-CZ`, `sk-SK`, `hu-HU`, `ko-KR` which use `". "`)
