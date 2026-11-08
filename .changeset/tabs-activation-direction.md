---
"@zag-js/tabs": minor
---

- Add `data-activation-direction` to every part, plus `api.activationDirection` and `activationDirection` in
  `onValueChange`, for animating panels in the direction of the selected tab.

- Add `getIndicatorState`, and add `orientation` and `activationDirection` to `getContentState`.

- Fix `setIndicatorRect` not moving the indicator.

- Fix `selectNext` and `selectPrevious` not selecting in manual mode and moving focus.

- Fix arrow keys pressed with a modifier switching tabs.

- Fix Home and End moving DOM focus when `virtualFocus` is set.

- Fix the indicator not following a scrolled tab list.

- Fix the tab list staying focused when focus moves to another tab list.
