---
"@zag-js/utils": patch
"@zag-js/utils": patch
"@zag-js/dom-query": patch
"@zag-js/image-cropper": patch
"@zag-js/file-upload": patch
"@zag-js/date-picker": patch
"@zag-js/number-input": patch
"@zag-js/progress": patch
"@zag-js/meter": patch
"@zag-js/scheduler": patch
---

- Fix step snapping returning float noise like `0.9999999999999992`, and counting steps written as `1e-7`.
- Fix `getValuePercent` returning `NaN` when min and max are equal.
- Fix the `mediumpurple` and `palevioletred` color values, and add `lightgray` and `transparent`. Color names now match
  in any case.
- Fix `getEndOfWeek` ignoring the locale's first day of the week.
- Fix `parseDateString` turning a day the month doesn't have, like Feb 31, into another date.
- Fix controls inside a disabled fieldset's first legend being treated as disabled.
- Fix the image cropper staying in a drag after the pointer is canceled.
- Fix the date picker moving focus back to its trigger after a right-click outside.
- Fix file types with parameters, like `text/plain;charset=utf-8`, failing the `accept` check.
