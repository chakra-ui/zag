---
"@zag-js/dom-query": minor
"@zag-js/slider": patch
"@zag-js/angle-slider": patch
"@zag-js/number-input": patch
"@zag-js/color-picker": patch
---

- Add `getEventMove`, which reads a key as a step in a direction (larger with Shift or Page keys, smaller with Alt) or a
  jump to a bound, following the slider and spinbutton patterns. Remove `getEventStepValue`.
- Add PageUp and PageDown to the angle slider, and make ArrowUp increase the angle like other sliders.
- Fix the angle slider's large steps leaving its step grid.
