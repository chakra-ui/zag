---
"@zag-js/date-picker": minor
---

- Add support for `minView` and `maxView` to provide better control of the datepicker views. This makes it easier to
  build month and year only pickers.

- Add new `parse` method to parse the input value and return a valid date. This should be paired with the `format`
  option to provide a better user experience.

- Add `locale` and `timeZone` to the `format` method.

- Add support for `placeholder` context property to customize the input placeholder text.

- Fix issue where entering very large invalid dates in the input field would cause the datepicker to crash.

- Fix issue in year view, where user is unable to select year when `min` and `max` dates are less than 1 year and
  overlap 2 unique years
