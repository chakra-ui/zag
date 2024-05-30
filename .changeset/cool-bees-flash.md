---
"@zag-js/popover": patch
---

Fix issue where `autoFocus` was not implemented. Now, it determines whether the popover should autofocus on open

- when `true`, the first focusable element or the content is focused
- when `false`, the content is focused
