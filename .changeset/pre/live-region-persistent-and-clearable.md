---
"@zag-js/live-region": patch
"@zag-js/combobox": patch
"@zag-js/select": patch
---

Fix three problems with screen reader announcements.

**The region is now created up front and kept.** It used to be removed and rebuilt on every `announce()`, with the text
written in a `setTimeout(0)` right after. Screen readers only announce a change to a region they already know about, so
a region created in the same tick is unreliable — VoiceOver in particular misses it, which is the platform combobox
announces on at all (`isApple()`).

**Announcements are cleared after 7s.** Nothing ever removed the text, so the last thing announced stayed in the
accessibility tree indefinitely as readable page content. A `timeout` option overrides the delay, and a new `clear()`
drops the current announcement immediately.

**Combobox and select clear instead of going stale.** Both bailed out when nothing was highlighted, leaving the previous
announcement in place — filter a combobox down to no results and the region still described an option that was gone.

Also adds `aria-atomic="true"` so multi-word messages are read whole, and gives each level its own region so a polite
announcer cannot inherit an assertive region left by another machine on the page.
