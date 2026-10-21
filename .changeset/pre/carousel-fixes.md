---
"@zag-js/carousel": patch
---

Fixes:

- A quick mouse flick now moves to the next page instead of snapping back. Slow drags, and drags that pause before
  release, still settle on the closest page.
- `scrollToIndex` now scrolls to slides that aren't the first slide of a page, e.g. when `slidesPerPage` is above 1.
- Changing `dir` at runtime in Vue now updates the snap points, so the prev/next triggers scroll again.
- Changing `orientation` or `dir` at runtime in Svelte no longer throws.
