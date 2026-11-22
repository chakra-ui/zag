---
"@zag-js/i18n-utils": patch
---

Fix `formatDate` not padding single-digit minutes and seconds for the `mm` and `ss` tokens. For example, `HH:mm:ss` now
formats 4:05:07 as `04:05:07` instead of `04:5:7`.
