---
"@zag-js/highlight-word": patch
---

- Fix the highlighted range with `ignoreCase` when lowercasing the text changes its length, for example `İ` in "İstanbul Ankara".
