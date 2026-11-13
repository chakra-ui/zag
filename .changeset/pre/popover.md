---
"@zag-js/popover": minor
---

- Add a `viewport` part to animate switching between triggers. Render a content per trigger with
  `getContentProps({ value })` and `getContentValues()`.

- Add `data-activation-direction` and `api.activationDirection`, and `data-transitioning` on the positioner and viewport
  while switching triggers.

- Add `data-instant` to the positioner, viewport and content, set to `click`, `dismiss`, `focus` or `trigger-change`.

- Accept a `value` in `getTitleProps` and `getDescriptionProps`.

- Fix Tab getting stuck after the trigger when the content has nothing focusable.
