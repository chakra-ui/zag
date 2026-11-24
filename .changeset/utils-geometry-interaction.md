---
"@zag-js/utils": major
"@zag-js/dom-query": major
"@zag-js/floating-panel": patch
"@zag-js/image-cropper": patch
---

- Move `@zag-js/rect-utils` to `@zag-js/utils/geometry`, and its DOM helpers (`getElementRect`, `getWindowRect`,
  `getViewportRect`, `fromRange` and `debugPolygon`) to `@zag-js/dom-query`. The old package is removed.
- Add the `@zag-js/utils/interaction` entrypoint for dragging and resizing a box: `applyMove`, `applyResize`, the handle
  checks, the keyboard deltas, and the new `getHandleStyle` and `getHandleCursor`.
- Use two-way resize cursors on floating panel and image cropper handles, like `ew-resize`, since a handle can grow or
  shrink the box.
- Export dom-query's public types, like `HTMLElementWithValue`, from its root.
