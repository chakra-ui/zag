---
"@zag-js/menu": minor
"@zag-js/select": minor
"@zag-js/combobox": minor
"@zag-js/listbox": minor
"@zag-js/popover": patch
"@zag-js/hover-card": patch
"@zag-js/color-picker": patch
"@zag-js/cascade-select": patch
"@zag-js/date-picker": patch
---

Added filter inputs and "no results" messages to menu and select. You filter the items; the input keeps focus while the
arrow keys move the highlight.

```tsx
// popupType: "dialog" on menu and select
<div {...api.getContentProps()}>
  <input {...api.getInputProps()} />
  <div {...api.getEmptyProps()}>{items.length === 0 && "No results"}</div>
  <div {...api.getListProps()}>{/* items */}</div>
</div>
```

- `getEmptyProps()` is a polite live region, so keep it rendered and toggle its text. Combobox and listbox have it too.
- **Menu**
  - **Breaking:** Replaced `composite` with `popupType: "menu" | "dialog"` (default `"menu"`), matching select and
    combobox. Migrate `composite: false` to `popupType: "dialog"`.
  - `autoHighlight` highlights the first item as the query changes. A submenu can have its own input; `Escape`,
    `Shift+Tab` or `ArrowLeft` on an empty input returns to the parent's.
  - `onHighlightChange` reports a `reason` (`keyboard`, `pointer` or `programmatic`), and `setHighlightedValue` accepts
    `null`.
- **Select**
  - `Home` and `End` jump to the first or last item when the input is empty, and `Shift+Tab` closes the select. A dialog
    popup opens below the trigger.
  - `alignItemWithTrigger` keeps the selected item of a long or wrapping list next to the trigger.
- Fixed issue where a lazily mounted popup inside nested dialogs rendered behind the dialog.
