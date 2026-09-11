---
"@zag-js/date-picker": minor
---

Add `restoreFocus` prop to control whether focus returns to the trigger when
the picker is dismissed by interacting outside. When unset, the existing
behavior is preserved: focus is restored only if the outside interaction
target is not focusable. Closing via the keyboard always restores focus.

Also fix the restore decision being read one cycle stale: the first
outside-click dismissal after mount never restored focus, while later
dismissals applied the previous cycle's decision. The restore behavior is
now consistent on every open/dismiss cycle.
