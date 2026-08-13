---
"@zag-js/number-flow": minor
---

Add `@zag-js/number-flow`, a state machine for animating a value change by rolling each digit to its new value. Use it
for prices, scores, and live metrics, where a number changing is worth noticing.

Formatting goes through `Intl.NumberFormat`, so currency, percent, and non-Latin numeral systems work out of the box.
Digits are keyed by decimal place, so `999` to `1000` adds one digit instead of re-keying the rest mid-roll.

Unlike most machines, a digit is not one element. You render `api.digitCells` as a strip of `0-9` inside each digit, and
the machine translates the strip so the right cell lands in view.

Parts: `root`, `valueText`, `digit`, `digitTrack`, `digitCell`, `symbol`.
