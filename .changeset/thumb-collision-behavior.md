---
"@zag-js/slider": minor
---

Add `thumbCollisionBehavior` prop to control how thumbs behave when they collide during pointer interactions:

- `none` (default): Thumbs cannot move past each other; excess movement is ignored.
- `push`: Thumbs push each other without restoring their previous positions when dragged back.
- `swap`: Thumbs swap places when dragged past each other.

