---
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/popover": patch
"@zag-js/focus-trap": patch
---

Apply `trapFocus`, `preventScroll` and `modal` while the dialog or drawer is open, and `modal` while the popover is
open. They were read once on entry, so the only way to change them was a remount, which is unusable for content that
cannot be recreated such as media playback or a running timer.

Releasing the focus trap no longer pulls focus back to the trigger. Focus is restored only when the component closes.
`trapFocus()` forwards deactivate options to make this possible.
