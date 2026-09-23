---
"@zag-js/core": patch
"@zag-js/svelte": patch
---

Fix `mergeProps` truncating style string values that contain a semicolon, such as `--label: "a;b"` or
`url("data:image/svg+xml;base64,...")`. Semicolons inside quoted values and functions like `url()` no longer split the
declaration (fixes #3359).
