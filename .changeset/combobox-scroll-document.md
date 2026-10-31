---
"@zag-js/combobox": patch
---

Fix the document scrolling when the highlighted item is scrolled into view (e.g. an open combobox with
`defaultHighlightedValue` on mount). Only the combobox content scrolls now, and only when the item isn't already
visible.
