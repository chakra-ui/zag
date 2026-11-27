---
"@zag-js/toast": minor
"@zag-js/dom-query": patch
---

- Announce toasts through shared live regions: errors assertively, others politely, a burst as one announcement, and an
  update only when its text changes.
- Remove `aria-live` from the toast group and `role="status"` from each toast; a toast is now a `group`.
- Require a flick to travel more than 8px before it dismisses a toast, at 0.3 px/ms or faster.
