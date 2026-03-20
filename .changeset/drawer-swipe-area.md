---
"@zag-js/drawer": minor
---

- Add `description` anatomy part with `aria-describedby` support on the content element
- Add `SwipeArea` part for swipe-to-open gestures from screen edges

  ```tsx
  <div {...api.getSwipeAreaProps()} />
  ```

- Add `getDescriptionProps()` and `getSwipeAreaProps()` to the connect API
- Require intentional swipe movement before showing the drawer (no flash on pointer down)
- Smooth settle animation from release point to fully open position
- Add cross-axis scroll preservation to prevent drawer drag when scrolling horizontally
- Fix swipe-to-dismiss in controlled mode (`open: true` without `onOpenChange` now blocks dismiss)
- Set `pointer-events: none` on positioner in non-modal mode so the page stays interactive
- Add initial focus management for non-modal mode
