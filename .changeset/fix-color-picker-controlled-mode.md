---
"@zag-js/color-picker": patch
"@zag-js/color-utils": patch
---

Fix color not updating in controlled mode when selecting black shades.

- Fixed equality check to compare actual channel values instead of CSS string output
- Auto-detect `defaultFormat` from initial color value instead of hardcoding `"rgba"`
