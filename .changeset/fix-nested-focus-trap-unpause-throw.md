---
"@zag-js/focus-trap": patch
---

Fix an uncaught error thrown when a nested focus trap (e.g. a popover or menu inside a dialog) deactivates and automatically resumes an outer trap that has no focusable element at that instant. The outer trap now silently skips refocusing instead of crashing.
