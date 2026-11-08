---
"@zag-js/splitter": patch
---

- Fix handles with a one-sided id, such as `"left:"`, not resizing.

- Fix handles breaking when a panel id contains `:`, as React's `useId` ids do.

- Fix dragging in RTL moving the handle the wrong way.

- Fix the handle lagging the pointer next to other handles or fixed-size content.

- Fix `Enter` collapsing from the starting size instead of the current one.

- Fix expanding not restoring the size from before the collapse.

- Fix `aria-valuenow` dropping below `aria-valuemin` when collapsed.

- Fix pixel limits not letting go when the group grows back.

- Fix hiding and showing a panel resetting the layout.

- Fix disabled handles missing `aria-disabled` and being reachable with `F6`.

- Add double-click on a handle to reset the panel before it.
