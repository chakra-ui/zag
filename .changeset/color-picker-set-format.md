---
"@zag-js/color-picker": patch
---

Fixed `api.setFormat` not changing the format. It converted the value and sent it back through `VALUE.SET`, which
converted it back to the current format, so the format never changed and `onFormatChange` never fired.
