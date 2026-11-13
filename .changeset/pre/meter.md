---
"@zag-js/meter": major
---

- Clamp controlled values to `min` and `max`, and allow `min` to equal `max`.

- Fall back to `min` when the value is `NaN`.

- Fix `percentAsString` using the value format instead of a percent.

- **Breaking:** Default the value to `min` instead of the midpoint. Pass a value to keep the old default.

  ```diff
  - meter.machine({ min: 0, max: 100 })
  + meter.machine({ min: 0, max: 100, defaultValue: 50 })
  ```
