---
"@zag-js/dismissable": patch
---

Fixed the page freezing when many overlays are open at once. With 120 open popovers, mounting took about 4.6 seconds and
unmounting took several minutes. Both now take around 100 milliseconds or less.
