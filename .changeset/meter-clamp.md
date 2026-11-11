---
"@zag-js/meter": minor
---

- Clamp controlled values to `min` and `max`.
- Allow `min` to equal `max`.
- Fall back to `min` when the value is `NaN`.
- Fix `percentAsString` using the value format instead of a percent.
- **Breaking:** Default the value to `min` instead of the midpoint.
