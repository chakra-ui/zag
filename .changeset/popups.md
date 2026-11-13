---
"@zag-js/menu": major
"@zag-js/select": major
"@zag-js/combobox": major
"@zag-js/listbox": major
"@zag-js/cascade-select": major
"@zag-js/popover": patch
"@zag-js/hover-card": patch
"@zag-js/color-picker": patch
"@zag-js/date-picker": patch
---

- Add a filter input and an empty state to menu and select with `popupType: "dialog"`. You filter the items; the input
  keeps focus while the arrow keys move the highlight.

  ```tsx
  <div {...api.getContentProps()}>
    <input {...api.getInputProps()} />
    <div {...api.getEmptyProps()}>{items.length === 0 && "No results"}</div>
    <div {...api.getListProps()}>{/* items */}</div>
  </div>
  ```

- Add `getEmptyProps()` to combobox and listbox. It's a polite live region, so keep it rendered and toggle its text.

- Fix a lazily mounted popup inside nested dialogs rendering behind the dialog.

**Breaking:** Set the highlight with `setHighlightedValue` in every list component, and pass `null` to clear it.

```diff
- api.setHighlightValue("react") // select, combobox, cascade select
- api.highlightValue("react") // listbox
+ api.setHighlightedValue("react")

- api.clearHighlightValue()
+ api.setHighlightedValue(null)
```

**Breaking (menu):** Replace `composite` with `popupType`, matching select and combobox.

```diff
- menu.machine({ composite: false })
+ menu.machine({ popupType: "dialog" })
```

- **Menu:** Add `autoHighlight` to highlight the first item as the query changes. A submenu can have its own input;
  `Escape`, `Shift+Tab` or `ArrowLeft` on an empty input returns to the parent's. `onHighlightChange` reports a
  `reason`.

- **Select:** `Home` and `End` jump to the first or last item when the input is empty, and `alignItemWithTrigger` keeps
  the selected item of a long list next to the trigger.
