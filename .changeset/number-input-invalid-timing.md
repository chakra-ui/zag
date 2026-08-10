---
"@zag-js/number-input": patch
---

- Fixed issue where `onValueInvalid` reported the wrong value and reason. With `max: 1000`, typing `5000` and blurring
  reported `rangeUnderflow` for the clamped value `1000`, which is in range. It now reports `rangeOverflow` and `5000`.
- Changed when `onValueInvalid` fires: as the out-of-range value is entered rather than on blur, and no longer when
  clamping brings the value back into range.
