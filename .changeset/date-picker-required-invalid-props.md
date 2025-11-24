---
"@zag-js/date-picker": patch
---

Add support for `required` and `invalid` props in date-picker

- Add `required` prop to mark the date picker as required for form validation
- Add `invalid` prop to mark the date picker as invalid
- Both props are now properly passed to the input element with appropriate ARIA attributes
- Exposed `disabled` and `invalid` in the date picker API for better state access
