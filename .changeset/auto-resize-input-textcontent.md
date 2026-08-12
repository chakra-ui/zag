---
"@zag-js/auto-resize": patch
---

Fix `autoResizeInput` assigning the input value to the measurement ghost element via `innerHTML`, which parsed the value as HTML and allowed DOM-based XSS (e.g. `<img src=x onerror=...>`) when the input value came from untrusted data such as a stored/edited tag. The ghost element now uses `textContent`, which both prevents the HTML parsing and measures the raw text width correctly.
