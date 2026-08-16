---
"@zag-js/auto-resize": patch
---

Fix an XSS vector in `autoResizeInput()`. The hidden ghost element used to measure width assigned the input's value with
`innerHTML`, so a value containing markup was parsed and could execute. It now uses `textContent`.
