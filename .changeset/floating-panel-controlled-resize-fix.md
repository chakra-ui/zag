---
"@zag-js/floating-panel": patch
---

Fix controlled floating panel behavior.

- Fix `open` taking precedence over `defaultOpen` during initialization
- Fix `api.setPosition` and `api.setSize` to work independently of drag/resize state
- Fix React `Maximum update depth exceeded` when content uses `ResizeObserver`
- Fix maximize/minimize restore reverting to `(0, 0)` in controlled mode
- Fix Escape during drag/resize to cancel and revert to original position/size
