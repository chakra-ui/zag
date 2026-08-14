---
"@zag-js/listbox": patch
---

Fix keyboard navigation moving the highlighted item when the mouse is resting over the list. Scrolling the item into view slid content under the cursor, and Safari treated the resulting pointermove as a real hover.
