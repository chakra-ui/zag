---
"@zag-js/select": patch
"@zag-js/menu": patch
"@zag-js/dom-query": patch
---

- **Select**
  - Fix Tab being trapped in the open list. Tab and Shift+Tab now close it and move focus to the element after or before
    the trigger.
  - Add press, drag and release: a mouse press on the trigger opens the list, and releasing over an item selects it. A
    quick click still opens the list without selecting, even when an item opens under the pointer.
- **Menu**: Fix Tab being trapped in an open menu. Tab and Shift+Tab now close every open menu and move focus to the
  element after or before the trigger.
- **DOM Query**: Add `getAdjacentTabbable`.
