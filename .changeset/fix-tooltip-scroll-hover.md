---
"@zag-js/tooltip": patch
---

Fix tooltip not showing when scrolling with pointer over trigger

- Added `onPointerOver` handler to complement `onPointerMove` for better hover detection during scroll events
- This ensures tooltips properly appear when the pointer enters the trigger element via scrolling, not just via pointer
  movement
