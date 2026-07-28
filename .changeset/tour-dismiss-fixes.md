---
"@zag-js/tour": patch
---

- Fixed issue where dismissing a tour from a step's `effect` skipped cleanup and could miss firing the "completed" status.
- Fixed issue where a tooltip step's position could reset unexpectedly when the tour closed.
