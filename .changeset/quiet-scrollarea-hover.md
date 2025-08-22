---
"@zag-js/scroll-area": patch
---

Prevent hover state from clearing when pointer moves into descendants or portals by guarding `onPointerLeave` with `contains` from `@zag-js/dom-query`. This avoids unintended scrollbar hide/show when interacting with sibling portals.