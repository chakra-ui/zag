---
"@zag-js/color-picker": patch
---

Fix color value to respect the specified `format` when setting values via props or `setValue`.

Previously, the internal color object could retain a mismatched format (e.g., RGB when `format` is `hsla`), causing
inconsistent `value` objects in `onValueChange` callbacks.
