---
"@zag-js/number-input": patch
---

Fix scrubbing always incrementing the value when `dir` is `rtl`. Dragging the scrubber toward the start now increments
and dragging toward the end decrements.
