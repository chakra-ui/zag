---
"@zag-js/tabs": major
---

- **Breaking:** Remove the indicator's inline transition and the `--transition-*` CSS variables. Add the transition in
  CSS, and turn it off for `data-instant`, which is set when the indicator moves for a reason other than a value change
  (first render, resize, `dir` or `orientation` change).

  ```diff
    [data-tabs-indicator] {
  -   --transition-duration: 0.2s;
  -   --transition-timing-function: ease-in-out;
  +   transition:
  +     left 0.2s ease-in-out,
  +     width 0.2s ease-in-out;
    }
  +
  + [data-tabs-indicator][data-instant] {
  +   transition: none;
  + }
  ```

- **Breaking:** Replace `data-ssr` with `data-indicator-pending`. It's set during server rendering and while the
  indicator hasn't been measured, such as inside a hidden panel.

  ```diff
  - [data-tabs-trigger][data-selected][data-ssr] { ... }
  + [data-tabs-trigger][data-selected][data-indicator-pending] { ... }
  ```

- Fix the indicator animating on resize after a transition never finished.

- Add `data-activation-direction` to every part, `api.activationDirection`, and `activationDirection` in
  `onValueChange`, for animating panels in the direction of the selected tab.

- Add `getIndicatorState`, and `orientation` and `activationDirection` to `getContentState`.

- Type `value` in `onValueChange` and `focusedValue` in `onFocusChange` as nullable. They're `null` after deselecting,
  and when focus leaves the list.

- Fix the indicator not following the selected tab when tabs are reordered, added, removed or scrolled.

- Fix `setIndicatorRect` not moving the indicator.

- Fix `selectNext` and `selectPrevious` not selecting in manual mode.

- Fix arrow keys pressed with a modifier switching tabs, and Home and End moving DOM focus with `virtualFocus`.

- Fix the tab list losing its tab stop when no tab is selected or the selected tab is disabled.

- Fix Home, End and `setValue` deselecting the selected tab when `deselectable` is set.

- Fix the tab list staying focused when focus moves to another tab list.
