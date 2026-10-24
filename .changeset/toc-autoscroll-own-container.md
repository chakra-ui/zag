---
"@zag-js/toc": patch
"@zag-js/dom-query": patch
---

- **TOC**: Fix `autoScroll` cancelling the smooth scroll from a link click when the nav sits inside the same scroll
  container as the content. Auto-scroll now only scrolls the TOC's own scroll container, and does nothing when the TOC
  doesn't scroll on its own.
- **DOM Query**: Add `scrollToNearest(el, { rootEl, behavior })`, which scrolls only `rootEl` by the least amount needed
  to show `el`.
