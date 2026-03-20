---
"@zag-js/drawer": minor
---

- Add `description` anatomy part with `aria-describedby` support on the content element
- Add `SwipeArea` part for swipe-to-open gestures from screen edges

  ```tsx
  // Invisible zone at the bottom of the screen for swipe-to-open
  <div {...api.getSwipeAreaProps()} />
  ```

- Add `getDescriptionProps()` and `getSwipeAreaProps()` to the connect API
- Require intentional swipe movement before showing the drawer (no flash on pointer down)
- Smooth settle animation from release point to fully open position
