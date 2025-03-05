---
"@zag-js/auto-resize": patch
---

- Fix issue where height calculations could be incorrect in high DPI scenarios.
- Account for `maxHeight`, `overflowY`, and `boxSizing` CSS properties.
- Calculate height when its form owner resets.
