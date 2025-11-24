---
"@zag-js/floating-panel": patch
---

- Ensure double-click behavior doesn't trigger when `resizable={false}` is set.
- Double-click behavior now checks `event.defaultPrevented` to allow users to prevent the default behavior by calling
  `event.preventDefault()`.
