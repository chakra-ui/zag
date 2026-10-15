---
"@zag-js/carousel": patch
---

- Fixed issue where changing `dir` at runtime in Vue left the carousel on stale snap points, so the prev/next triggers
  updated the page but didn't scroll.
- Fixed issue where changing `orientation` or `dir` at runtime in Svelte threw an error.
