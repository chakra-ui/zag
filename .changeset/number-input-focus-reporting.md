---
"@zag-js/number-input": patch
---

- Fixed issue where `onFocusChange` reported focus the input never received. Pressing a stepper or the scrubber reported
  `focused: true` even when `focusInputOnChange` was `false` and nothing was focused. Focus is now reported from the
  input's own focus event.
- Fixed issue where pressing `Enter` reported `onFocusChange({ focused: false })` while the input kept focus.
