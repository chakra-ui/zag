---
"@zag-js/number-input": patch
---

Fix issue where firefox doesn't fire the pointerup event consistently on disabled button. This created an bug where it
required an extra click when the value is decreased to 0.
