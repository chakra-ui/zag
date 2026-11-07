---
"@zag-js/toast": patch
---

Fixed issue where a progress bar driven by `--duration` jumped when the toast was paused and resumed. `--duration` is
now the toast's total duration instead of the remaining time, so pausing the animation with `animation-play-state` stays
in sync with the dismiss timer.
