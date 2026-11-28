---
"@zag-js/scheduler": patch
---

- Auto-scroll while dragging past the grid's edge, and keep the dragged event under the pointer as the grid scrolls.

- Undo a cancelled drag instead of committing it.

- Fix the last pointer move before a drop being dropped.

- Follow only the pointer that started a drag, and end drags when the window loses focus or a context menu opens.
