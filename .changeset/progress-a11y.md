---
"@zag-js/progress": minor
---

- Label the progress bar with the `label` part and expose the value via `aria-valuetext`.
- Remove `aria-live` from the value text.
- Clamp the value to `min` and `max`.
- Treat `NaN` and `Infinity` as indeterminate.
- **Breaking:** Default the value to `min` instead of the midpoint.
