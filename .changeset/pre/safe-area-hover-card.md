---
"@zag-js/safe-area": minor
"@zag-js/hover-card": minor
"@zag-js/tooltip": minor
---

Add `@zag-js/safe-area` and use it in the hover card to track the pointer travelling between the trigger and the
content.

- Fixed issue where the hover card closed while the pointer was still on its way to the content. Moving diagonally, or
  pausing for longer than `closeDelay`, no longer dismisses it.
- Fixed issue where a hover card opened programmatically or by keyboard was dismissed by pointer movement anywhere on
  the page.

The `open` and `closing` states are now `open.idle` and `open.closing`. `state.matches("open")` still works, but code
matching the literal state `"closing"` should use `"open.closing"`.

The tooltip uses it too when `interactive` is set, so the pointer can reach a hoverable tooltip without it closing on
the way (WCAG 1.4.13). Non-interactive tooltips are unchanged.
