---
"@zag-js/select": major
---

Move `role="listbox"` and related ARIA semantics from the `content` part to the
`list` part. The `content` part now acts as a presentational wrapper (or
`role="dialog"` when `popupType="dialog"`), allowing consumers to render headers,
footers, search inputs, tabs, and other widgets inside the popup without
polluting the listbox's accessibility tree.

**Breaking change** — markup must wrap items in `<div {...api.getListProps()}>`
inside `<div {...api.getContentProps()}>`:

```tsx
// Before
<div {...api.getPositionerProps()}>
  <ul {...api.getContentProps()}>
    {items.map(item => <li {...api.getItemProps({ item })}>...</li>)}
  </ul>
</div>

// After
<div {...api.getPositionerProps()}>
  <div {...api.getContentProps()}>
    <div {...api.getListProps()}>
      {items.map(item => <div {...api.getItemProps({ item })}>...</div>)}
    </div>
  </div>
</div>
```

Other changes:

- `aria-controls` on the trigger now points to the list id, not the content id.
- The list element is the keyboard focus target. `scrollIntoView`, scroll arrows,
  `scrollToIndexFn`, and the activedescendant observer all anchor on the list.
- New `initialFocusEl: () => HTMLElement | null` prop redirects initial focus
  on open (e.g., to a search input rendered inside content).
- Content's keymap now skips `Home`, `End`, and `Space` when the event target
  is an editable element, so a search input inside content can type freely
  while arrow keys still navigate the listbox.
- Stale `highlightedValue` is reconciled in `syncCollection` when the value
  is no longer in the collection (e.g., after filtering).
- Live region announcements (mirrors combobox) — assertive announcement of the
  highlighted option label, gated on Apple platforms when the list is focused
  and always when focus is elsewhere (search input, composed widgets).
- Scroll arrows now render inside content (siblings of list) instead of the
  positioner, matching base-ui's pattern.
- Replaced `composite` with `popupType: "listbox" | "dialog"` (default
  `"listbox"`). `popupType="dialog"` makes `content` carry `role="dialog"` and
  `aria-haspopup="dialog"` on the trigger; the `list` always carries
  `role="listbox"` regardless. Migrate `composite: false` → `popupType: "dialog"`.
