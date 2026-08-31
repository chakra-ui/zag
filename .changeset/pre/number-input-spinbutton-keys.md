---
"@zag-js/number-input": patch
---

- Fixed issue where `PageUp` and `PageDown` did not step the value. They now step by `largeStep`, matching
  `Shift + ArrowUp` and `Shift + ArrowDown`.
- Fixed issue where `aria-valuetext` was only set via `translations.valueText`, so a value formatted as `$500.00` was
  announced as "500" by screen readers. It now falls back to the formatted value.
