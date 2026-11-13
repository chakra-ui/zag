---
"@zag-js/carousel": patch
---

- Fix a quick mouse flick snapping back instead of moving to the next page.

- Fix `scrollToIndex` not scrolling to slides that aren't the first of a page.

- Fix changing `dir` at runtime not updating the snap points in Vue.

- Fix changing `orientation` or `dir` at runtime throwing in Svelte.
