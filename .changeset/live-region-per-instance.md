---
"@zag-js/live-region": minor
---

Give each live region its own element and pending announcement.

- `announce(message, delay)` replaces only this region's pending announcement. Before, every region shared the
  `#__live-region__` element, so an announcement from one component could drop another's.
- Add `cancel()` to drop the pending announcement without removing the region.
- `destroy()` now also cancels the pending announcement.
- Regions no longer have an `id`. Select them with `[data-live-announcer]`.
