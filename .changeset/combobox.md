---
"@zag-js/combobox": major
---

- **Breaking:** Replace `disableLayer` with `inline`. An inline combobox is always open, isn't positioned or
  dismissable, and doesn't call `onOpenChange`. The content gets `data-inline`.

  ```diff
    combobox.machine({
  -   open: true,
  -   disableLayer: true,
  +   inline: true,
    })
  ```

- Fix a highlight set with `setHighlightedValue` right after the collection changes moving to the first item.

- Fix keyboard navigation not scrolling the highlighted item into view when an inline combobox's input mounts late, such
  as inside a dialog.
