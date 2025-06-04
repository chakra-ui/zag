---
"@zag-js/slider": patch
---

- Fix issue where `Shift` + `ArrowRight` set value to `0` instead of `max` when step is too large (e.g. `20`)
- Fix issue where `onValueChangeEnd` doesn't return the latest value when dragging very fast
