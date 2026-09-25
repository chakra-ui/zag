---
"@zag-js/image-cropper": patch
---

Fixed issue where resizing the selection with `Alt+Arrow` ignored `aspectRatio` and `cropShape: "circle"`. Keyboard
resizing now keeps the ratio, matching handle resizing.
