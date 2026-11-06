---
"@zag-js/hover-card": patch
"@zag-js/tooltip": patch
"@zag-js/focus-visible": patch
"@zag-js/safe-area": patch
"@zag-js/dismissable": patch
---

- **Hover Card**
  - Fix a card opened without hovering its trigger, such as with `defaultOpen` or a controlled `open`, closing when the
    pointer passes over it and leaves.
  - Fix a card or menu opened from inside the card closing the card when the pointer moves onto it. Opening a menu from
    the card now keeps it open until it's dismissed.
  - Fix `onOpenChange` reporting a close twice when a controlled card is dismissed while a hover close is pending.
  - Fix the card reopening when focus returns to its trigger as the window regains focus.
  - Fix the card staying open when its trigger is removed.
  - Add `data-instant` to the content, set to `focus` when focus opens the card and `dismiss` when Escape closes it, so
    the animation can be skipped.
- **Tooltip**: Fix a closed tooltip reopening when focus returns to its trigger as the window regains focus.
- **Focus Visible**: Add `isFocusRestoredByWindow`.
- **Safe Area**: Add the `isTargetInside` option.
- **Dismissable**: Add `isInNestedLayer`.
