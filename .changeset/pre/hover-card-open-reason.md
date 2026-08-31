---
"@zag-js/hover-card": minor
---

Add a `reason` to `onOpenChange`, describing what caused the change.

- Added `reason` to `onOpenChange` details: `trigger-hover`, `trigger-focus`, `trigger-blur`, `pointer-leave`,
  `interact-outside`, `escape-key` or `script`. `api.setOpen` accepts a reason as its second argument, defaulting to
  `script`.
- Fixed issue where dismissing with the `Escape` key was reported the same way as pressing outside.
- Fixed issue where leaving the trigger before the open delay elapsed fired `onOpenChange` with `open: false`, even
  though the hover card had never opened.
