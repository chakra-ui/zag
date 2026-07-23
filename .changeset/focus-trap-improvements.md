---
"@zag-js/focus-trap": patch
---

- Fixed issue where returning focus on deactivate could silently steal focus back from an element the app legitimately
  focused in the meantime (e.g. opening a follow-up dialog right after closing the current one, or a parent trap
  reclaiming its own initial focus after being unpaused).

- Fixed issue where deactivating a nested trap (e.g. a popover inside a dialog) could throw an uncaught error if the
  outer trap's container had no connected focusable element at that exact instant, even though the outer trap was still
  fully active.

- Pass `focusVisible: true` when returning focus after a keyboard-driven deactivation (e.g. `Escape`), so the focus ring
  reliably shows on the returned-to element.

- Added a `persistentElements` option so portalled content that isn't discoverable via `aria-controls`/`aria-expanded`
  can be declared as part of the trap, matching the option of the same name in `@zag-js/dismissable`.
