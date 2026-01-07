---
"@zag-js/slider": patch
---

Fix pointer movement when dragging slider thumb from its edge in `thumbAlignment="contain"` mode.

The value calculation now correctly accounts for thumb inset, ensuring consistent behavior when:

- Clicking on the track to set a value
- Dragging the thumb from any position (center, left edge, or right edge)
