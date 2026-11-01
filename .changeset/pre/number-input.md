---
"@zag-js/number-input": minor
---

### Scrubber and step sizes

```ts
numberInput.machine({
  largeStep: 10, // Shift, PageUp/PageDown (default step * 10)
  smallStep: 0.1, // Alt/Option (default step * 0.1)
  snapOnStep: true,
  scrubberDirection: "vertical", // default "horizontal"
  scrubberPixelSensitivity: 4, // pixels per step (default 2)
  scrubberTeleportDistance: 200, // cursor wrap distance (default: viewport edges)
})
```

- **Breaking:** The scrubber cursor is no longer created for you. Render it with `getScrubberCursorProps()`.
- Added `reason` to `onValueChange` and `onValueCommit` details: `input-change`, `input-blur`, `keyboard`,
  `increment-press`, `decrement-press`, `wheel`, `scrub` or `script`.

### Fixes

- `onValueCommit` fires once per settled interaction, including a released stepper, a finished scrub and `api.setValue`.
- `aria-valuetext` falls back to the formatted value, so `$500.00` is no longer announced as "500".
- `onFocusChange` reports only the input's real focus.
- `onValueInvalid` reports the entered value and reason, as it is entered rather than on blur.
- A hold interrupted by touch scrolling no longer leaves the value stepping, and holding a stepper on touch no longer
  opens the context menu.
