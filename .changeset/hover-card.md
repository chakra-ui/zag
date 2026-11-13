---
"@zag-js/hover-card": minor
---

- Add a `viewport` part to animate switching between triggers. Render a content per trigger with
  `getContentProps({ value })` and `getContentValues()`.

- Add `data-activation-direction` and `api.activationDirection`, and `data-transitioning` on the positioner and viewport
  while switching triggers.

- Add `data-instant` to the content when focus opens the card or Escape closes it, so the animation can be skipped.

- Fix a card opened without hovering its trigger, such as with `defaultOpen`, closing when the pointer passes over it.

- Fix a card or menu opened from inside the card closing it.

- Fix `onOpenChange` reporting a close twice when a controlled card is dismissed during a pending hover close.

- Fix the card reopening when the window regains focus, and staying open when its trigger is removed.
