---
"@zag-js/color-picker": patch
---

- Add `role="dialog"` to color picker content when not inline to ensure proper `aria-controls` detection
- Add `aria-haspopup="dialog"` to color picker trigger when not inline for better accessibility
