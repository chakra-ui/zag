---
"@zag-js/number-input": patch
"@zag-js/react": patch
---

Fix characters being dropped or transposed when typing quickly. A keystroke that landed before the queued input sync ran
was overwritten by the text and cursor recorded before it, so `123456789` could end up as `1234789` and `1.5` as `15.`
(closes #2680).
