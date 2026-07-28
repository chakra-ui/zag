---
"@zag-js/marquee": patch
---

Fix the marquee scrolling speed depending on the content width. The duration is now derived from the
content size (the actual translation distance) instead of the root size, so the configured 
matches the real pixel speed even when the content is smaller than the viewport.
