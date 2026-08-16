---
"@zag-js/focus-visible": patch
---

Fix `trackFocusVisible()` classifying pointer focus as virtual when activating a label briefly moves focus to an overlay
container. Clicking a checkbox, radio or switch label added `data-focus-visible` to the control.
