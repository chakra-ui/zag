---
"@zag-js/menu": patch
---

Keep a submenu open while the pointer is still over it or over its trigger item. The intent polygon is captured once
from the submenu's rect, so a submenu that is still animating in or being repositioned was measured in the wrong place
and closed under the pointer.
