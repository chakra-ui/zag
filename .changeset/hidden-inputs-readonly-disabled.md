---
"@zag-js/radio-group": patch
"@zag-js/file-upload": patch
"@zag-js/slider": patch
"@zag-js/angle-slider": patch
---

Fix the hidden input to follow the native form rule: only a disabled component leaves the form. A read-only radio group
and file upload now submit their value, and a disabled slider and angle slider no longer do. This changes the submitted
form data for these cases.
