---
"@zag-js/number-flow": minor
---

- Grow or shrink digits and symbols in place while they fade in or out (e.g. `999` to `1,000`), and roll new digits in
  by one step.

- Apply `transformTiming` to enter and exit transitions. It had no effect before.

- Default rolls and transitions to a spring-like easing over `900ms`.

- Add `data-entering` and `data-exiting` to digits and symbols while they animate.

- Fix digits going blank during rapid updates.

- Fix reordering `formatOptions` keys restarting the format update.
