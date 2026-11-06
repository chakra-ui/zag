---
"@zag-js/pin-input": major
---

- **Breaking change:** Remove `blurOnComplete`. Move focus in `onValueComplete` instead, such as to the submit button.

  ```diff
  - blurOnComplete: true,
  + onValueComplete() {
  +   document.getElementById("verify")?.focus()
  + },
  ```

- **Breaking change:** Remove `selectOnFocus`. A focused input always selects its character now, so delete the prop.

  ```diff
  - selectOnFocus: true,
  ```

- **Breaking change:** Rename `sanitizeValue` to `normalizeValue`, which also applies to typed text.

  ```diff
  - sanitizeValue: (value) => value.toUpperCase(),
  + normalizeValue: (value) => value.toUpperCase(),
  ```

- Drop spaces and invalid characters from pasted text instead of rejecting it, and report them through `onValueInvalid`.
- Fill from the first input when a full code is pasted or autofilled into any input.
- Only set `autocomplete="one-time-code"` on the first input when `otp` is set.
- Delete everything before the cursor on Cmd/Ctrl/Alt + Backspace, as in a single text field.
- Fix Backspace, Delete and paste changing a `readOnly` value.
- Fix pasting into a filled input clearing the characters after it.
- Fix two characters inserted at once keeping only the last one.
- Fix `onValueComplete` and `autoSubmit` not running when a pasted code replaces a complete one.
- Fix focus staying on a later input after the value is cleared from outside the field.
- Fix IME input filling the wrong input and accepting full-width characters.
