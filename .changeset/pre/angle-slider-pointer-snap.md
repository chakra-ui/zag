---
"@zag-js/angle-slider": patch
---

Fixed issue where dragging snapped the angle up instead of to the nearest step. Crossing 0°/360° now wraps instead of
sticking, and non-divisor steps (e.g. `step: 5`) no longer produce an out-of-range `360`.
