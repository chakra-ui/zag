---
"@zag-js/combobox": patch
---

Use option `value` to handle component logic instead of `label`, to account for usecases where label could be the same. E.x.: a list of people where some might have the same names.
