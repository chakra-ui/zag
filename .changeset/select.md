---
"@zag-js/select": minor
---

- Add a select-all option for `multiple` with `getSelectAllProps` and `getSelectAllState`. It comes first in keyboard
  order and reads as checked, unchecked or mixed. It renders with the item part and `data-type="select-all"`; regular
  items get `data-type="item"`.

  ```tsx
  <ul {...api.getListProps()}>
    <li {...api.getSelectAllProps()}>Select all</li>
    {items.map((item) => (
      <li key={item.value} {...api.getItemProps({ item })}>
        {item.label}
      </li>
    ))}
  </ul>
  ```

- Add Page Up and Page Down to move the highlight by `pageSize` items (default `10`).

- Fix `selectAll()` and `Ctrl/Cmd+A` selecting disabled items.

- Scroll the items' own scrolling element when it sits inside the list, so a select-all option above it stays in view.

- Speed up rendering with many selected items: 10k selected items render in ~3ms instead of ~465ms.

- Fix `aria-labelledby` pointing to a missing element when the label part isn't rendered.
