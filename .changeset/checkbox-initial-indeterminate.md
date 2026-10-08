---
"@zag-js/checkbox": patch
---

Fixed issue where a checkbox that starts as `indeterminate` (via `defaultChecked` or `checked`) left the hidden input's
`indeterminate` property as `false` until the first change (#3402).
