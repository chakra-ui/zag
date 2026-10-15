---
"@zag-js/menu": patch
---

Fixed controlled submenus (`open` + `onOpenChange`) opening after the pointer left their trigger before the open delay
ended. Sweeping the pointer across several controlled submenu triggers no longer opens each of them in turn.
