---
"@zag-js/dnd": patch
---

- Auto-scroll past the container's edge, up to 3 times faster further out, and not while the pointer is beside it. The
  default `scrollMaxSpeed` rises from 4 to 6.

- Undo a cancelled drag instead of committing it.

- Follow only the pointer that started a drag, and end drags when the window loses focus or a context menu opens.
