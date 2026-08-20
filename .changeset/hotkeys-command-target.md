---
"@zag-js/hotkeys": patch
---

- Add `target` option to hotkey commands for scoping a command to a DOM subtree. Accepts an element or a function
  returning one (resolved on every event, so late-mounted elements work). The command only fires when the event
  originates within the target. Targeted commands take priority over global ones on the same hotkey, and the same hotkey
  registered on different targets is no longer reported as a conflict.

```ts
store.register({
  id: "grid.down",
  hotkey: "ArrowDown",
  action: moveDown,
  options: { target: () => gridEl },
})
```

- Add Linux platform detection. `formatHotkey` with `platform: "auto"` now resolves `linux` on Linux (formatting `Meta`
  as `Super`) instead of falling back to `windows`.
