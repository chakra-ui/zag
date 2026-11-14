---
"@zag-js/combobox": patch
"@zag-js/editable": patch
---

- **Combobox**: Fix a controlled `inputValue` that rejects or transforms an edit. The input now shows the controlled
  value and keeps the caret in place. Pair `inputValue` with `onInputValueChange`, or use `defaultInputValue` to set
  only the initial value.

- **Combobox**: Fix IME composition committing the input value before the text is confirmed.

- **Editable**: Fix IME composition committing the value before the text is confirmed.
