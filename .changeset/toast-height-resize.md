---
"@zag-js/toast": patch
"@zag-js/dom-query": patch
---

- Fix toast height not updating when its content resizes, such as text rewrapping after a window resize.
- Fix the shared resize observers throwing when `ResizeObserver` is unavailable, such as in jsdom.
