---
"@zag-js/combobox": major
---

- **Breaking:** Replace `inputBehavior` with `autoHighlight`. Inline completion moves to `@zag-js/autocomplete`, and so
  do search fields that submit on Enter (`alwaysSubmitOnEnter` is removed).

  ```diff
  - inputBehavior: "autohighlight",
  + autoHighlight: true,
  ```

- **Breaking:** Submit the selected value with `getHiddenInputProps`. The form now gets the item's value instead of its
  label, and `name` and `form` move to the hidden input. With `multiple`, render one per item in `value`.

  ```diff
    <input {...api.getInputProps()} />
  + <input {...api.getHiddenInputProps()} />
  ```

- **Breaking:** Clear a single selection when its text is emptied. `Escape` brings it back while the list is open, and
  `onValueChange` reports `"input-clear"` and `"escape-key"`.

- Add chips for `multiple` with `getChipGroupProps`, `getChipProps` and `getChipDeleteTriggerProps`.

- Add a create option with `onCreate` and `getCreateItemProps`. It shows when the text matches no item, and selects the
  value `onCreate` returns. Return a Promise to create on a server; `signal` aborts when the list closes or the text
  changes.

  ```ts
  async onCreate({ inputValue, signal }) {
    const tag = await createTag(inputValue, { signal })
    return tag.id
  }
  ```

- Add a select-all option for `multiple` with `getSelectAllProps`, `getSelectAllState` and `selectAll()`.

- Add `getSeparatorProps`, Page Up and Page Down (`pageSize`, default `10`), and a `highlightedItem` translation.

- Center the highlighted item when the list opens, like select.

- Fix a controlled `inputValue` that rejects or transforms an edit, and IME composition committing text early.

- Fix a value selected before its item exists never resolving its label.

- Fix `Escape` needing a second press, Tab stopping on a scrolling list, and `Enter` submitting in Vue when the text
  would be rejected.

- Speed up rendering with many selected items: 10k selected items render in ~3ms instead of ~465ms.
