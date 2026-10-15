---
"@zag-js/select": major
"@zag-js/combobox": major
"@zag-js/listbox": major
---

**Breaking:** In select, combobox and listbox, `role="listbox"` moved from the `content` part to a new `list` part.
`content` is now a plain wrapper, so the popup can hold headers, footers, search inputs and other widgets. Wrap your
items in `getListProps()` inside `getContentProps()`:

```diff
- <ul {...api.getContentProps()}>
-   {items.map((item) => <li {...api.getItemProps({ item })}>...</li>)}
- </ul>
+ <div {...api.getContentProps()}>
+   <ul {...api.getListProps()}>
+     {items.map((item) => <li {...api.getItemProps({ item })}>...</li>)}
+   </ul>
+ </div>
```

- **Select and combobox:** Replaced `composite` with `popupType: "listbox" | "dialog"` (default `"listbox"`). Migrate
  `composite: false` to `popupType: "dialog"`, which makes `content` a dialog.
- **Select**
  - Added `initialFocusEl` to move focus on open, e.g. to a search input inside the content.
  - Typing in an input inside the content no longer triggers `Home`, `End` or `Space`.
  - Scroll arrows now render inside the content, as siblings of the list.
  - The highlighted option is announced to screen readers, like combobox.
- **Combobox:** `scrollContentToTop` is renamed to `scrollToTop`.
- **Listbox:** The list element is now the focus target.
