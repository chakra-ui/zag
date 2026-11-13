---
"@zag-js/combobox": patch
"@zag-js/editable": patch
---

- **Combobox**: Fix a controlled `inputValue` not being enforced on the input, so rejected edits no longer show.
- **Combobox**: Fix IME composition committing the input value before the text is confirmed.
- **Editable**: Fix IME composition committing the value before the text is confirmed.
