---
"@zag-js/menu": patch
---

Fix controlled menus restoring focus to their opening trigger after pressing another focusable element outside. Focus a
closed menu's trigger on pointerdown so switching between menus keeps focus on the pressed trigger until its menu opens.
Preserve the focus intent when controlled close confirmation is delayed. Keep touch taps opening menu triggers in
WebKit.
