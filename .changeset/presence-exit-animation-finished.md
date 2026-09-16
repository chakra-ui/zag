---
"@zag-js/presence": patch
---

Fixed issue where an element with an exit animation could stay mounted forever in WebKit. The exit animation can finish
before the machine starts listening for `animationend`, leaving a closed, invisible element in the DOM that still
intercepts clicks. The machine now checks whether the animation is still running before waiting for it.
