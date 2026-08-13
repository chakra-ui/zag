---
"@zag-js/focus-visible": patch
---

Fix `trackFocusVisible()` misclassifying pointer focus as virtual when label activation temporarily focuses an overlay
container, which incorrectly added `data-focus-visible` to checkbox, radio, and switch controls.
