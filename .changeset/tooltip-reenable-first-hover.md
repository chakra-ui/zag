---
"@zag-js/tooltip": patch
---

- Fix the first hover after re-enabling a disabled tooltip not opening it. A tooltip dismissed with Escape now stays
  closed when `disabled` is toggled while the pointer is still on the trigger.
