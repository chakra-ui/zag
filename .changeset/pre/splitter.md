---
"@zag-js/splitter": minor
---

- Add `collapsedThreshold` to panels. A drag now opens a collapsed panel halfway to `minSize` by default.

- Add `disabled` to the splitter and to panels.

- Accept units in `resizePanel`, such as `"200px"`.

- Add double-click on a handle to reset the panel before it.

- Fix handles with a one-sided id, such as `"left:"`, or panel ids containing `:` not resizing.

- Fix dragging in RTL moving the handle the wrong way, and the handle lagging the pointer near other handles.

- Fix `Enter` collapsing from the starting size, and expanding not restoring the size from before the collapse.

- Fix `aria-valuenow` dropping below `aria-valuemin` when collapsed.

- Fix pixel limits not letting go when the group grows back, and hiding a panel resetting the layout.

- Fix disabled handles missing `aria-disabled` and being reachable with `F6`.
