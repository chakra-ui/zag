---
"@zag-js/accordion": patch
---

Fix case sensitivity typo in accordion machine where the `setValue` function could not send it's data to `value` because
the `type` prop value `VALUE.SET` was lowercase.
