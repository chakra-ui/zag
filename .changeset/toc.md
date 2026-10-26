---
"@zag-js/toc": minor
---

- Add a `multiple` prop. Set it to `false` to keep only the topmost visible heading active.
- Activate the clicked item right away and keep it active while the page scrolls to it.
- Activate the section the reader is in when its heading has scrolled out of view, instead of keeping a stale item.
- Fix `autoScroll` interrupting the smooth scroll to a heading when the TOC sits inside the content's scroll container.
