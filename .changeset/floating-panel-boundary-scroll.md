---
"@zag-js/floating-panel": patch
---

Fixed issue where the panel did not follow its boundary element when an ancestor scrolled, leaving it visually outside the
boundary until it was moved.

```jsx
const service = useMachine(floatingPanel.machine, {
  getBoundaryEl: () => boundaryRef.current,
})
```
