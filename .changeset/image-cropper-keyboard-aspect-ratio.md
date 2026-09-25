---
"@zag-js/image-cropper": patch
---

Fix `Alt+Arrow` keyboard resize ignoring `aspectRatio` and `cropShape: "circle"`. The selection now keeps its ratio, as
it does when resized from a handle.
