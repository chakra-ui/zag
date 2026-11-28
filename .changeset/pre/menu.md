---
"@zag-js/menu": major
---

- **Breaking:** Render the items inside `api.getListProps()`, like select and combobox. The list is what scrolls, so a
  filter input, header or footer stays in place outside it. With one content per trigger, pass the same `value` to
  `getListProps({ value })` as to `getContentProps({ value })`.

  ```diff
    <div {...api.getContentProps()}>
  -   {items.map((item) => <div {...api.getItemProps(item)} />)}
  +   <div {...api.getListProps()}>
  +     {items.map((item) => <div {...api.getItemProps(item)} />)}
  +   </div>
    </div>
  ```

- Add `api.removeChild(child)` to unregister a submenu when it unmounts.

- Add Page Up and Page Down to move the highlight by `pageSize` items (default `10`).

- Keep a touch long-press on a context menu trigger going through small finger movement.

- Fix the release after a long-press selecting the item under the finger.

- Fix focus not returning to the parent menu when a submenu that isn't portalled closes.

- Fix the highlighted item not scrolling into view when navigating from a filter input.
