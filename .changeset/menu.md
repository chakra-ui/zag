---
"@zag-js/menu": minor
---

- Add a `viewport` part to animate switching between triggers. Render a content per trigger with
  `getContentProps({ value })` and `getContentValues()`.

- Add `data-activation-direction` and `api.activationDirection`, and `data-transitioning` on the positioner and viewport
  while switching triggers.

- Add an optional `collection` prop and `scrollToIndexFn` for virtualized menus, so the keyboard and typeahead reach
  items that aren't rendered.

- Fix Tab being trapped in an open menu. Tab and Shift+Tab close every open menu and move focus past the trigger.

- Fix a submenu closing without calling `onOpenChange` when the pointer moves away from it.

- Keep focus where it is when `api.setOpen(open, "trigger-hover")` opens or closes the menu, for menus that open on
  hover.
