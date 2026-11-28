---
"@zag-js/dialog": major
---

- **Breaking:** Replace `trapFocus` and `preventScroll` with `modal`. `modal: "trap-focus"` traps focus without locking
  scroll or blocking the page.

  ```diff
  - trapFocus: true, preventScroll: false
  + modal: "trap-focus"
  ```

  ```ts
  modal: true // trap focus, lock scroll, block outside pointers, hide the page from screen readers (default)
  modal: "trap-focus" // trap focus only; the page stays scrollable and usable
  modal: false // no focus trap or scroll lock
  ```
