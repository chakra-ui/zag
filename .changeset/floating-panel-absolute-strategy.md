---
"@zag-js/floating-panel": patch
---

Fixed issue where `strategy: "absolute"` positioned the panel outside its boundary. The machine computes viewport
coordinates, which `absolute` resolves against the offset parent instead. Absolute panels are now placed correctly, and
are clipped by a scrolling boundary as expected.

```jsx
const service = useMachine(floatingPanel.machine, {
  strategy: "absolute",
  getBoundaryEl: () => boundaryRef.current,
})
```
