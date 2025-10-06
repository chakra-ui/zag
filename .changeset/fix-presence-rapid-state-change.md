---
"@zag-js/presence": patch
---

Fix race condition where dialog remains closed when `open` prop rapidly changes from `true` to `false` to `true`
