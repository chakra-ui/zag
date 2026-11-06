---
"@zag-js/hover-card": patch
"@zag-js/tooltip": patch
"@zag-js/focus-visible": patch
"@zag-js/safe-area": patch
"@zag-js/dismissable": patch
---

- **Hover Card**
  - Fix a card opened without hovering its trigger, such as with `defaultOpen`, closing when the pointer passes over it.
  - Fix a card or menu opened from inside the card closing it. Opening a menu from the card now keeps it open until
    dismissed.
  - Fix `onOpenChange` reporting a close twice when a controlled card is dismissed during a pending hover close.
  - Fix the card reopening when the window regains focus.
  - Fix the card staying open when its trigger is removed.
  - Add `data-instant` to the content when focus opens the card or Escape closes it, so the animation can be skipped.
- **Tooltip**: Fix a closed tooltip reopening when the window regains focus.
- **Focus Visible**: Add `isFocusRestoredByWindow`.
- **Safe Area**: Add the `isTargetInside` option.
- **Dismissable**: Add `isInNestedLayer`.
