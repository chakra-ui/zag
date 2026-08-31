---
"@zag-js/rect-utils": minor
"@zag-js/floating-panel": minor
"@zag-js/image-cropper": minor
---

Add shared resize/move engine to `@zag-js/rect-utils`. Both floating panel and image cropper now delegate all
constrained rect manipulation to this engine.

**New `@zag-js/rect-utils` exports:**

- `applyMove`, `applyResize` — pointer-driven move and resize with boundary, size limits, aspect ratio, grid snap, and
  center-origin support
- `clampPointInRange`, `centerInRect`, `centerOnPoint` — point/rect positioning helpers
- `getDirectionDelta`, `getArrowKeyDelta`, `getKeyboardResizeDelta` — keyboard interaction helpers
- `getCenterPoint`, `getMidpoint`, `isVisibleSize`, `scaleRect`, `scaleSize`, `roundRect`, `ZERO_POINT` — general
  rect/point utilities
- `isLeftHandle`, `isRightHandle`, `isTopHandle`, `isBottomHandle`, `isCornerHandle`, `isHorizontalHandle`,
  `isVerticalHandle` — handle direction helpers
- `HandlePosition` type

**Breaking: Removed from `@zag-js/rect-utils`:**

- `resizeRect`, `AffineTransform`, `compassDirectionMap`, `oppositeDirectionMap`, `ScalingOptions`

**Breaking: Unified handle naming across floating panel and image cropper:**

- Floating panel: `ResizeTriggerProps.axis` → `.placement`, `data-axis` → `data-placement`, `ResizeTriggerAxis` removed
  (use `HandlePosition`), `resizeTriggerAxes` → `resizeTriggerPlacements`
- Image cropper: `HandleProps.position` → `.placement`, `data-position` → `data-placement`, `handles` → `placements`
