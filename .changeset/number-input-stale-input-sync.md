---
"@zag-js/number-input": patch
---

Fix characters being dropped or transposed when typing quickly. A keystroke that landed before the queued input sync ran
was overwritten by the text and cursor recorded before it, so `1.5` could end up as `15.` and `50000` as `5000` (closes
#2680).
