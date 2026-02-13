---
"@zag-js/popper": patch
"@zag-js/popover": patch
---

Improve performance by reducing the number of style recalculations when scrolling with heavy content. Add
`sizeMiddleware` positioning option to optionally disable the size middleware for better scroll performance when not
using `sameWidth` or `fitViewport`.
