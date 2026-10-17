---
"@zag-js/live-region": minor
---

Make announcements more reliable across screen readers.

- Each region is added to the DOM when created and stays there. `announce` clears its text, then sets the message after
  `delay` (at least 100ms), so screen readers pick up the change and can repeat the same message. Before, every
  announcement inserted a new element, which some screen readers miss.
- Each region has its own element and pending announcement. Before, every region shared the `#__live-region__` element,
  so an announcement from one component could drop another's.
- Add `cancel()` to drop the pending announcement without removing the region.
- `destroy()` now also cancels the pending announcement.
- Regions no longer have an `id`. Select them with `[data-live-announcer]`.
