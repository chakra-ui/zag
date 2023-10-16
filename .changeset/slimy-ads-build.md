---
"@zag-js/slider": minor
---

Merge the slider and range slider machines into one to prevent duplication.

Some notable changes:

- `value` and `onValueChange` type has been updated to be `number[]`
- Update `api.getThumbProps(index)` to `api.getThumbProps({ index })`
