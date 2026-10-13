---
"@zag-js/number-flow": minor
---

Smoother transitions when the number gains or loses digits.

- Digits and symbols that enter or exit (e.g. `999` to `1,000`) now grow or shrink in place while fading, instead of
  popping in and out. New digits also roll in by one step.
- `transformTiming` now controls these enter and exit transitions. Previously it had no effect.
- The default timing for rolls and transitions is now a spring-like easing over `900ms`.
- Digits and symbols expose `data-entering` and `data-exiting` while they animate in or out.
- Fixed issue where reordering `formatOptions` keys restarted the format update.
