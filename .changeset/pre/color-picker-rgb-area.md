---
"@zag-js/color-picker": patch
---

Fixed issue where the channel slider track threw `Unknown color channel: hue` whenever the picker held an RGB color,
which a hex `defaultValue` produces.
