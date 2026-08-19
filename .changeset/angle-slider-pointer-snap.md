---
"@zag-js/angle-slider": patch
---

Fix pointer drag snapping. The angle now snaps to the **nearest** step (previously it always rounded up) and wraps
within `[0, 360)`, so dragging is precise and crossing 0°/360° wraps instead of sticking. This also avoids an
out-of-range `360` value that could occur with non-divisor steps (e.g. `step: 5`).
