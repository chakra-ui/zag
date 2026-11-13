---
"@zag-js/progress": major
---

- Label the progress bar with the `label` part and expose the value via `aria-valuetext`.

- Remove `aria-live` from the value text.

- Clamp the value to `min` and `max`, and treat `NaN` and `Infinity` as indeterminate.

- Fix `percentAsString` using the value format instead of a percent.

- **Breaking:** Default the value to `min` instead of the midpoint. Pass a value to keep the old default.

  ```diff
  - progress.machine({ min: 0, max: 100 })
  + progress.machine({ min: 0, max: 100, defaultValue: 50 })
  ```
