---
"@zag-js/collection": patch
"@zag-js/listbox": patch
---

Fixed issue where range selection anchored on the highlighted item, letting hover and arrow keys drag the anchor away
from the item you actually clicked.

- Shift+clicking with `highlightOnHover` now selects the full range, instead of just the clicked item
- Successive shift+clicks extend from the originally clicked item, so a range can be shrunk as well as grown
- Shift+arrow can now reverse direction without leaving items behind
