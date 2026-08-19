---
"@zag-js/number-input": minor
---

- Added `reason` to `onValueChange` and `onValueCommit` details, describing what caused the change: `input-change`,
  `input-blur`, `keyboard`, `increment-press`, `decrement-press`, `wheel`, `scrub` or `script`.
- Fixed issue where `onValueCommit` did not fire for a released stepper, a finished scrub, `api.setValue` or
  `api.clearValue`. It now fires once per settled interaction, including a scrub that streams many steps.
