---
"@zag-js/floating-panel": patch
---

Fix the arrow keys moving the panel the wrong way when `dir` is `rtl`. The panel is positioned with a physical `left`
offset, so `ArrowLeft` now moves it left and `ArrowRight` moves it right in both directions.
