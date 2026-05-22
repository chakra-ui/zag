---
"@zag-js/splitter": minor
---

- Add CSS unit support for `defaultSize`, `minSize`, and `maxSize`. The splitter now accepts `px`, `em`, `rem`, `vh`,
  and `vw` in addition to percentages, and resolves them to percentages after hydration.

```tsx
const service = useMachine(splitter.machine, {
  panels: [
    { id: "nav", minSize: "240px", maxSize: "480px" },
    { id: "main", minSize: 30 },
  ],
  defaultSize: ["240px", "60vw"],
})
```

- Add `resizeBehavior` per panel. Set to `"preserve-pixel-size"` to keep a panel's pixel size constant when the parent
  splitter group resizes. Leave at least one panel as `"preserve-relative-size"` (the default) so the layout can absorb
  the change.

```tsx
panels: [
  { id: "nav", minSize: 20 },
  {
    id: "main",
    minSize: "240px",
    maxSize: "480px",
    resizeBehavior: "preserve-pixel-size",
  },
  { id: "aside", minSize: 20 },
]
```

- Allow non-panel children inside the splitter root for fixed toolbars, rails, or status areas that should not be
  managed as panels. Use partial trigger ids (`"left:"`, `":right"`) to bind handles around the fixed element.

```tsx
<div {...api.getRootProps()}>
  <div {...api.getPanelProps({ id: "left" })}>Left</div>
  <div {...api.getResizeTriggerProps({ id: "left:" })} />
  <div style={{ flex: "0 0 180px" }}>Fixed sized element</div>
  <div {...api.getResizeTriggerProps({ id: ":right" })} />
  <div {...api.getPanelProps({ id: "right" })}>Right</div>
</div>
```
