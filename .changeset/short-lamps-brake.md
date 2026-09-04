---
"@zag-js/hover-card": patch
---

Fix issue where hover card closes when the pointer crosses the gap between the trigger and the content (e.g. when using
`positioning.gutter`). The close delay is now paused while the pointer travels across the grace area between both
elements.
