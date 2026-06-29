---
"@zag-js/number-input": minor
"@zag-js/slider": minor
---

Fixed issue where `Cmd`/`Ctrl` + arrow keys produced values off the `step` grid (e.g. non-integer values when
`step: 1`). Stepping with modifier keys now stays aligned to `step`.

Replaced the implicit modifier-based stepping with explicit, configurable props:

- **Slider**: added `largeStep` (defaults to `10 * step`) used when `Shift` or `PageUp`/`PageDown` is pressed.
- **Number Input**: added `largeStep` (defaults to `10 * step`, on `Shift`) and `smallStep` (defaults to `step / 10`, on
  `Alt`).

The defaults preserve the previous stepping magnitudes, so existing behavior is unchanged unless the new props are set.
