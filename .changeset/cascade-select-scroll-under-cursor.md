---
"@zag-js/cascade-select": patch
---

Fix keyboard navigation moving the highlighted item when the mouse is resting over a cascade-select column. Scrolling the item into view slid content under the cursor, and the resulting pointer events were treated as a real hover.
