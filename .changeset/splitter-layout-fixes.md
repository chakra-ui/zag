---
"@zag-js/splitter": patch
---

- Fix handles with a one-sided id, such as `"left:"`, not resizing.

- Fix dragging in RTL moving the handle the opposite way from the pointer.

- Fix the handle lagging behind the pointer when the group has handles or fixed-size content. Pixel sizes are now
  measured against the panels' space too.

- Fix `Enter` collapsing a panel from its starting size instead of its current size.

- Fix expanding a panel not restoring the size it had before it collapsed by dragging or the keyboard.

- Fix `aria-valuenow` dropping below `aria-valuemin` when a panel collapses.

- Fix a pixel `minSize` or `maxSize` not letting go once the group grows back.

- Fix hiding a panel and showing it again resetting the layout. Changing a panel's limits keeps the layout too.

- Fix disabled handles missing `aria-disabled`, being reached by `F6`, and being draggable with the registry.

- Fix the `keyboardResizeBy` docs, which said pixels. It's a percentage.

- Add double-clicking a handle to reset the panel before it to its default size.
