---
"@zag-js/dom-query": patch
"@zag-js/bottom-sheet": patch
"@zag-js/carousel": patch
"@zag-js/floating-panel": patch
"@zag-js/image-cropper": patch
"@zag-js/radio-group": patch
"@zag-js/slider": patch
"@zag-js/tabs": patch
---

Refactor to use shared `ResizeObserver` implementation across all machines. This significantly improves performance by
using a single observer instance with `WeakMap` based subscriptions instead of creating separate observers for each
component instance.
