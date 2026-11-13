---
"@zag-js/radio-group": major
---

- **Breaking:** Remove the indicator's inline transition and the `--transition-*` CSS variables. Add the transition in
  CSS, and turn it off for `data-instant`, which is set when the indicator moves for a reason other than a value change
  (first render, resize, `dir` or `orientation` change).

  ```diff
    [data-radio-group-indicator] {
  -   --transition-duration: 0.2s;
  -   --transition-timing-function: ease-in-out;
  +   transition:
  +     left 0.2s ease-in-out,
  +     width 0.2s ease-in-out;
    }
  +
  + [data-radio-group-indicator][data-instant] {
  +   transition: none;
  + }
  ```

- **Breaking:** Replace `data-ssr` with `data-indicator-pending`. It's set during server rendering and while the
  indicator hasn't been measured, such as inside a hidden panel.

  ```diff
  - [data-radio-group-item][data-state="checked"][data-ssr] { ... }
  + [data-radio-group-item][data-state="checked"][data-indicator-pending] { ... }
  ```

- Fix the indicator animating on resize after a transition never finished.

- **Breaking:** Submit the value of a read-only radio group. Only a disabled one is left out of the form, like a native
  input.
