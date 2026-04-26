---
"@zag-js/listbox": major
---

Move `role="listbox"` and related ARIA semantics from the `content` part to a new `list` part. The `content` part now
acts as a presentational wrapper, allowing consumers to render headers, footers, and search inputs inside the popup
without polluting the listbox's accessibility tree.

**Breaking change** — markup must be updated to render `<ul {...api.getListProps()}>` inside `<div {...api.getContentProps()}>`:

```tsx
// Before
<div {...api.getRootProps()}>
  <ul {...api.getContentProps()}>
    {items.map(item => <li {...api.getItemProps({ item })}>...</li>)}
  </ul>
</div>

// After
<div {...api.getRootProps()}>
  <div {...api.getContentProps()}>
    <ul {...api.getListProps()}>
      {items.map(item => <li {...api.getItemProps({ item })}>...</li>)}
    </ul>
  </div>
</div>
```

Changes:

- New `getListProps()` carries `role="listbox"`, `aria-activedescendant`, `aria-multiselectable`, `aria-labelledby`,
  and `tabIndex=0`. The list element is the keyboard focus target.
- `getContentProps()` no longer carries listbox semantics. Keyboard handlers remain on content as event delegation,
  so a custom `<input>` rendered inside content can drive list navigation via key bubbling.
- `aria-controls` on the input now points to the list id, not the content id.
- `scrollIntoView` retargets to the list element. Virtualized listboxes should attach the scroll ref to the list.
- New `list` part added to anatomy. New `getListId` / `getListEl` DOM helpers.
