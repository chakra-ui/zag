---
"@zag-js/accordion": minor
---

Remove support for passing value as `string`.

The `value` property must be an array of strings.

- When `multiple` is `false`, the array must contain a single string.
- When `multiple` is `true`, the array can contain multiple strings.
