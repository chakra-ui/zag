---
"@zag-js/dom-query": patch
---

Fix Firefox virtual click detection by removing deprecated `mozInputSource` check and using `PointerEvent.pointerType === ""` with `isTrusted`. Preserves Android-specific behavior.