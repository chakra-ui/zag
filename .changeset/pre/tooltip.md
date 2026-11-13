---
"@zag-js/tooltip": minor
---

- Add a `viewport` part to animate switching between triggers. Render a content per trigger with
  `getContentProps({ value })` and `getContentValues()`.

- Add `data-activation-direction` and `api.activationDirection`, and `data-transitioning` on the positioner and viewport
  while switching triggers.

- Fix the tooltip opening after the trigger is clicked during the open delay.

- Fix the next tooltip waiting for its full delay when hovered shortly after another closes.

- Fix a closed tooltip reopening when the window regains focus.

- Fix Escape not closing the tooltip inside an iframe.
