---
"@zag-js/dialog": major
"@zag-js/drawer": major
"@zag-js/popover": minor
"@zag-js/types": minor
---

- Accept `modal: "trap-focus"` in dialog, drawer and popover to trap focus without locking scroll or blocking the page.
- Remove `trapFocus` and `preventScroll` from dialog and drawer; use `modal`.
- Keep a non-modal drawer open on outside click by default, like dialog.
- Add the `ModalMode` type.
