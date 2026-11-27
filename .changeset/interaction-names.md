---
"@zag-js/utils": major
"@zag-js/floating-panel": patch
"@zag-js/image-cropper": major
---

- Rename the `@zag-js/utils/interaction` helpers: `moveBox`, `resizeBox`, `handleStyle`, `handleCursor`, `arrowDelta`,
  `resizeKeyDelta`, `centerIn`, `centerOn` and `clampBetween`. Replace the seven handle checks with `hasEdge` and
  `isCorner`, and remove `getDirectionDelta`.
- Rename `HandlePosition` to `HandlePlacement`.
- Snap `gridSize` to grid lines rather than whole steps, and keep fractional moves without a grid.
- Stop announcing and calling `onPositionChangeEnd` or `onSizeChangeEnd` when a keyboard move or resize is blocked.
