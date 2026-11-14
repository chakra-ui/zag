---
"@zag-js/combobox": major
---

- Add `getHiddenInputProps` to submit the selected value in forms. With `multiple`, render one per item in `value`.

  The form now submits the item's value instead of its label, and `name` and `form` move from the input to the hidden
  input.

  ```diff
    <input {...api.getInputProps()} />
  + <input {...api.getHiddenInputProps()} />
  ```
