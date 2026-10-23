---
"@zag-js/live-region": minor
---

- Keep one element per region in the DOM, so announcements from different components no longer drop each other.
- Add `cancel()` to drop a pending announcement, and cancel it in `destroy()`.
- Allow `root` to be a function.
- **Breaking change:** Regions no longer have an `id`. Select them with `[data-live-announcer]` instead of
  `#__live-region__`.
