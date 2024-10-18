---
"@zag-js/presence": patch
---

Fix issue where elements that use the presence machine doesn't exit unmounting state when closed with delay and the
active tab is switched.

This is because the v8 engine doesn't trigger the animationend event when the tab is inactive even though the "present"
state had changed before the tab is switched.
