---
"@zag-js/floating-panel": patch
---

Fix the positioner's inline z-index overriding custom CSS layers. Use `--z-index` in CSS to preserve panel stacking.
Fixes #3628.
