---
"@zag-js/pin-input": major
---

- **Breaking:** Remove `blurOnComplete`. Move focus in `onValueComplete` instead.

  ```diff
  - blurOnComplete: true,
  + onValueComplete() {
  +   document.getElementById("verify")?.focus()
  + },
  ```

- **Breaking:** Remove `selectOnFocus`. A focused input always selects its character.

  ```diff
  - selectOnFocus: true,
  ```

- **Breaking:** Rename `sanitizeValue` to `normalizeValue`, which also applies to typed text.

  ```diff
  - sanitizeValue: (value) => value.toUpperCase(),
  + normalizeValue: (value) => value.toUpperCase(),
  ```

- Drop spaces and invalid characters from pasted text instead of rejecting it, and report them through `onValueInvalid`.

- Fill from the first input when a full code is pasted or autofilled into any input.

- Only set `autocomplete="one-time-code"` on the first input, and only when `otp` is set.

- Delete everything before the cursor on Cmd/Ctrl/Alt + Backspace.

- Fix Backspace, Delete and paste changing a `readOnly` value.

- Fix pasting into a filled input clearing the characters after it, and two characters inserted at once keeping only the
  last.

- Fix `onValueComplete` and `autoSubmit` not running when a pasted code replaces a complete one.

- Fix focus staying on a later input after the value is cleared from outside.

- Fix IME input filling the wrong input and accepting full-width characters.
