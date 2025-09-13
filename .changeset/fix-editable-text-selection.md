---
"@zag-js/editable": patch
---

Allow text selection in editable preview when `autoResize` is enabled

Previously, when `autoResize` was set to `true`, the preview element had `userSelect: "none"` applied, preventing users
from selecting text. This has been fixed by removing the `userSelect` style property.
