---
"@zag-js/menu": patch
---

Fix issue where quick diagonal pointer movement toward an open submenu could flash the highlight across sibling items
you skim past. The active item now stays stable while you move fast toward the submenu.
