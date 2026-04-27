---
"@zag-js/combobox": major
---

Move `role="listbox"` and related ARIA semantics from the `content` part to the
`list` part. The `content` part now acts as a presentational wrapper (or
`role="dialog"` when opted in), allowing consumers to render headers, footers,
search inputs, tabs, and other widgets inside the popup without polluting the
listbox's accessibility tree.

**Breaking change** — markup must wrap items in `<div {...api.getListProps()}>`
inside `<div {...api.getContentProps()}>`:

```tsx
// Before
<div {...api.getPositionerProps()}>
  {options.length > 0 && (
    <ul {...api.getContentProps()}>
      {options.map(item => <li {...api.getItemProps({ item })}>...</li>)}
    </ul>
  )}
</div>

// After
<div {...api.getPositionerProps()}>
  <div {...api.getContentProps()}>
    {options.length > 0 && (
      <div {...api.getListProps()}>
        {options.map(item => <div {...api.getItemProps({ item })}>...</div>)}
      </div>
    )}
  </div>
</div>
```

Other changes:

- Replaced `composite` with `popupType: "listbox" | "dialog"` (default
  `"listbox"`). One declaration captures the popover-style pattern:
  - Drives `aria-haspopup` on the trigger (`"listbox"` or `"dialog"`).
  - Drives content's `role` (`"presentation"` or `"dialog"`).
  - Drives trigger's keyboard handling default (`"dialog"` enables arrow-key
    handling on the trigger when focused).
  - Drives label-click target default (`"dialog"` makes label clicks focus the
    trigger; `"listbox"` lets `htmlFor` focus the input).
  - Migrate `composite: false` → `popupType: "dialog"`. List always carries
    `role="listbox"` regardless.
- `aria-controls` on the input and trigger now lists both the list id and content
  id (multi-id, valid ARIA). Keeps the dismissable utility's trigger-ancestor
  scrollbar exclusion working without per-machine wiring.
- The list element is the scroll anchor. `scrollIntoView` rootEl, `scrollToIndexFn`,
  and `scrollToTop` (renamed from `scrollContentToTop`) all target the list element.
- New `list` part added to the anatomy. New `getListId` / `getListEl` DOM helpers
  and `ids.list` override.
