---
"@zag-js/types": patch
"@zag-js/utils": patch
"@zag-js/carousel": patch
"@zag-js/date-input": patch
"@zag-js/date-picker": patch
"@zag-js/editable": patch
"@zag-js/floating-panel": patch
"@zag-js/image-cropper": patch
"@zag-js/marquee": patch
"@zag-js/pin-input": patch
"@zag-js/progress": patch
"@zag-js/rating-group": patch
"@zag-js/signature-pad": patch
"@zag-js/tags-input": patch
---

Fix the `translations` prop requiring every `IntlTranslations` message. You can pass one key and the rest fall back to the defaults (fixes #3287).

`@zag-js/types` now exports a `Partial` that allows `undefined` on optional keys, matching `exactOptionalPropertyTypes`.
