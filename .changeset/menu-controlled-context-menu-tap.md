---
"@zag-js/menu": patch
---

Fixed controlled context menus (`open` + `onOpenChange`) opening about 700ms after a short tap on touch devices. A tap
on the context trigger no longer opens the menu. A long press still opens it.
