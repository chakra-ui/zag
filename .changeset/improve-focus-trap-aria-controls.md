---
"@zag-js/focus-trap": minor
"@zag-js/aria-hidden": minor
---

Improve focus trap and aria-hidden to handle `aria-controls` elements

- Focus trap now includes elements referenced by `aria-controls` as part of the trap
- Aria-hidden now preserves controlled elements when their controller is visible
- Makes select/popover components work seamlessly inside modal dialogs
