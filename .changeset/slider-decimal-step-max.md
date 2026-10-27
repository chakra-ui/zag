---
"@zag-js/utils": patch
"@zag-js/slider": patch
---

- **Slider**: Fix stepping past `max` with a decimal `step` (e.g. `max: 0.3`, `step: 0.1`) moving the value down a step.
