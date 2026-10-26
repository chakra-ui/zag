---
"@zag-js/splitter": patch
---

Fix the resize trigger's `aria-orientation`. It now describes the separator itself, so a horizontal splitter (panels
side by side, resized with Left/Right) reports `vertical`, as in the WAI-ARIA window splitter pattern.
