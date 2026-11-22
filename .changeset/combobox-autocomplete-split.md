---
"@zag-js/combobox": major
---

- **Breaking:** Replace `inputBehavior` with `autoHighlight`. Inline completion (`inputBehavior: "autocomplete"`) moves
  to `@zag-js/autocomplete`.

  ```diff
  - inputBehavior: "autohighlight",
  + autoHighlight: true,
  ```

- **Breaking:** Remove `alwaysSubmitOnEnter`. Use `@zag-js/autocomplete` for search fields that submit on Enter.

- Add `getSeparatorProps` to separate groups of items.

- Add a create option with `onCreate` and `getCreateItemProps`. It shows when the text matches no item and selects the
  value `onCreate` returns. Return a Promise to create on a server.

- Add chips for `multiple` with `getChipGroupProps`, `getChipProps` and `getChipDeleteTriggerProps`. The arrow keys move
  between chips, Backspace and Delete remove them (from an empty input, the first Backspace focuses the last chip),
  deletions are announced, and `onValueChange` reports `"chip-delete"`.

- Fix a value selected before its item is in the collection never resolving its label once the item arrives.

- Add a select-all option for `multiple` with `getSelectAllProps` and `getSelectAllState`. It comes first in keyboard
  order, toggles every selectable item that matches the text, and reads as checked, unchecked or mixed. Add
  `selectAll()` to the API.

- Render the select-all and create options with the item part, marked `data-type="select-all"` and `data-type="create"`;
  regular items get `data-type="item"`.

- Fix Tab stopping on a scrolling list instead of leaving the field.

- **Breaking:** Clear a single selection when its text is emptied. `Escape` brings it back while the list is open.
  `onValueChange` reports `"input-clear"` and `"escape-key"`.

- Fix `Escape` needing a second press to restore the chosen label over typed text.

- Fix `Enter` submitting the form in Vue when the typed text would be rejected.
