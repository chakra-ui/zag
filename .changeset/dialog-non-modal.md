---
"@zag-js/dialog": patch
---

- Set `pointer-events: none` on positioner in non-modal mode so the page stays interactive
- Add initial focus management for non-modal mode (mirrors popover behavior)
- Fix `aria-modal` to reflect actual `modal` prop value instead of hardcoded `true`
