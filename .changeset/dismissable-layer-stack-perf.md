---
"@zag-js/dismissable": patch
---

Fixed the page freezing when many overlays are open at once. Each layer add and remove re-scanned the whole stack for
every layer, so 120 open popovers took several seconds to mount. It now takes a few milliseconds.
