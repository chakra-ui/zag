---
"@zag-js/number-input": patch
---

- Fix issue when value updates due to intl formatting does not trigger `onValueChange`
- Fix issue where increment and decrement buttons doesn't respect locales (esp. when locales uses decimal commas and not
  decimal points)
