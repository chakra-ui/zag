---
"@zag-js/live-region": minor
---

- Keep one element per region in the DOM, so announcements from different components no longer drop each other.
- Add `cancel()` to drop a pending announcement, and let `root` accept a function.
- Cancel the pending announcement in `destroy()`.
- **Breaking change:** Regions no longer have an `id`. Select them with `[data-live-announcer]` instead of
  `#__live-region__`.
