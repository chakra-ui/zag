---
"@zag-js/floating-panel": patch
---

Fix panel stacking when multiple panels are open:

- Closing a panel now removes it from the stack, so the next panel becomes topmost.
- Stack order now applies to the positioner, so focusing a panel raises it above its siblings.
