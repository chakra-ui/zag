---
"@zag-js/drawer": major
---

- **Breaking:** Replace `trapFocus` and `preventScroll` with `modal`. `modal: "trap-focus"` traps focus without locking
  scroll or blocking the page.

  ```diff
  - trapFocus: true, preventScroll: false
  + modal: "trap-focus"
  ```

- Keep a non-modal drawer open on outside click by default, like dialog.

- Add keyboard support to the grabber when there are several snap points: press to step, arrow keys, Home and End, with
  a `translations.grabber` label.

- Add CSS variables to the content and backdrop for motion tied to the drawer's position, and `data-snap-point` on the
  content and grabber.

  | Variable            | Value                                                          |
  | ------------------- | -------------------------------------------------------------- |
  | `--drawer-progress` | 0 to 1 as the drawer opens                                     |
  | `--drawer-dim`      | 0 to 1 for the backdrop, easing off during a swipe to close    |
  | `--drawer-expand`   | 0 to 1 as the drawer moves between its two largest snap points |
  | `--drawer-stack`    | how many drawers are open on top of this one                   |

  ```css
  [data-drawer-backdrop] {
    opacity: var(--drawer-dim);
  }
  ```

- Let `data-swipe-ignore` keep a drawer from swiping, alongside `data-no-drag`.

- Fix the backdrop clearing at once when a swipe closes the drawer, and lightening when it's pulled further open.

- Fix a fast swipe's speed carrying over to the next open or snap, and the documented defaults of
  `swipeVelocityThreshold` (500) and `closeThreshold` (0.5).
